import { create } from 'zustand';
import { io } from 'socket.io-client';

// UPDATE THIS TO YOUR TAILSCALE IP
const API_URL = 'http://100.88.175.25:3000'; 

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  currentView: 'LIVE_QUEUE',
  players: [],
  globalPlayers: [],
  pendingGames: [],
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Championship Court', activeGame: null }
  ],

  setView: (view) => set({ currentView: view }),

  initSession: async () => {
    if (get().socket) return; 
    try {
      let sessionRes = await fetch(`${API_URL}/sessions/active`);
      let sessionText = await sessionRes.text();
      let session = sessionText ? JSON.parse(sessionText) : null;
      if (!session) {
        const createRes = await fetch(`${API_URL}/sessions`, { method: 'POST' });
        session = await createRes.json();
      }
      const currentSessionId = session.id;

      const [playersRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`),
        fetch(`${API_URL}/games/session/${currentSessionId}`)
      ]);

      const players = await playersRes.json();
      const allGames = await gamesRes.json();
      const pendingGames = allGames.filter(g => g.status === 'PENDING');
      const activeGames = allGames.filter(g => g.status === 'ACTIVE');

      const updatedCourts = get().courts.map(court => {
        const gameOnThisCourt = activeGames.find(g => g.courtId === court.id);
        return { ...court, activeGame: gameOnThisCourt || null };
      });

      set({ sessionId: currentSessionId, players, pendingGames, courts: updatedCourts });

      const socket = io(API_URL);
      socket.on('connect', () => {
        set({ isConnected: true, socket });
        socket.emit('joinSession', { sessionId: currentSessionId });
      });

      socket.on('boardStateUpdated', (data) => {
        const { action } = data;
        if (action === 'REFRESH_ALL' || action === 'RESET_BOARD') {
           window.location.reload();
        } else {
           // We'll let the standard refresh handle most things for now to stay synced
           get().initSession(); 
        }
      });
    } catch (error) { console.error("Init error:", error); }
  },

  fetchGlobalPlayers: async () => {
    try {
      const res = await fetch(`${API_URL}/players/global`);
      const data = await res.json();
      set({ globalPlayers: data });
    } catch (e) { console.error(e); }
  },

  inviteToSession: async (memberId) => {
    const { sessionId } = get();
    await fetch(`${API_URL}/players/${memberId}/join-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId })
    });
    window.location.reload(); // Simple sync
  },

  bulkUpload: async (playersArray, target) => {
    const { sessionId } = get();
    const endpoint = target === 'GLOBAL' 
      ? `${API_URL}/players/bulk-global` 
      : `${API_URL}/players/bulk-session`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players: playersArray, sessionId })
      });
      if (res.ok) {
        window.location.reload();
        return true;
      }
    } catch (e) { console.error(e); return false; }
  },

  resetSession: async () => {
    const { sessionId } = get();
    if (!sessionId || !window.confirm("End session?")) return;
    await fetch(`${API_URL}/sessions/${sessionId}/complete`, { method: 'PATCH' });
    window.location.reload();
  },

  addPlayer: async (p) => {
    const { sessionId } = get();
    await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, sessionId })
    });
    window.location.reload();
  },

  draftGame: async (data) => {
    const { sessionId } = get();
    const dbData = {
      session: { connect: { id: sessionId } },
      type: data.type,
      status: 'PENDING',
      teamA: { connect: data.teamA.map(p => ({ id: p.id })) },
      teamB: { connect: data.teamB.map(p => ({ id: p.id })) }
    };
    await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });
    window.location.reload();
  },

  assignGameToCourt: async (gameId, courtId) => {
    await fetch(`${API_URL}/games/${gameId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courtId })
    });
    window.location.reload();
  },

  completeGame: async (courtId, gameId, resultData) => {
    await fetch(`${API_URL}/games/${gameId}/complete`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });
    window.location.reload();
  }
}));

export default useQueueStore;
