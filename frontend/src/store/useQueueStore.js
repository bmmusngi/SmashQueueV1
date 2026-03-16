import { create } from 'zustand';
import { io } from 'socket.io-client';

// Ensure this matches your Tailscale IP
const API_URL = 'http://100.88.175.25:3000'; 

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  currentView: 'LIVE_QUEUE',
  players: [],
  globalPlayers: [],
  pendingGames: [],
  
  // FIXED: Hardcoded courts to bypass DB schema issues during build
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Championship Court', activeGame: null }
  ],

  // UI Actions
  setView: (view) => set({ currentView: view }),

  // Initialization Logic
  initSession: async () => {
    if (get().socket) return; 

    try {
      // 1. Get Active Session
      const sessionRes = await fetch(`${API_URL}/sessions/active`);
      if (!sessionRes.ok) throw new Error("Backend not responding");
      
      const sessionText = await sessionRes.text();
      let session = sessionText ? JSON.parse(sessionText) : null;

      if (!session) {
        const createRes = await fetch(`${API_URL}/sessions`, { method: 'POST' });
        session = await createRes.json();
      }
      
      const currentSessionId = session.id;

      // 2. Fetch Players & Games
      const [playersRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`),
        fetch(`${API_URL}/games/session/${currentSessionId}`)
      ]);

      const players = (await playersRes.json()) || [];
      const allGames = (await gamesRes.json()) || [];

      const pendingGames = allGames.filter(g => g?.status === 'PENDING');
      const activeGames = allGames.filter(g => g?.status === 'ACTIVE');

      // 3. Map Games to the Hardcoded Courts
      const updatedCourts = get().courts.map(court => {
        const gameOnThisCourt = activeGames.find(g => g.courtId === court.id);
        return { ...court, activeGame: gameOnThisCourt || null };
      });

      set({ 
        sessionId: currentSessionId, 
        players, 
        pendingGames, 
        courts: updatedCourts 
      });

      // 4. Socket Connection
      const socket = io(API_URL);
      socket.on('connect', () => {
        set({ isConnected: true, socket });
        socket.emit('joinSession', { sessionId: currentSessionId });
      });

      socket.on('boardStateUpdated', (data) => {
        // Only refresh if it's a major change, otherwise re-run init logic
        if (data.action === 'REFRESH_ALL' || data.action === 'RESET_BOARD') {
           window.location.reload();
        } else {
           get().initSession();
        }
      });

    } catch (error) { 
      console.error("Init error:", error);
      set({ sessionId: 'OFFLINE' });
    }
  },

  // Member & Roster Logic
  fetchGlobalPlayers: async () => {
    try {
      const res = await fetch(`${API_URL}/players/global`);
      const data = await res.json();
      set({ globalPlayers: Array.isArray(data) ? data : [] });
    } catch (e) { 
      console.error("Global fetch error:", e); 
    }
  },

  inviteToSession: async (memberId) => {
    const { sessionId } = get();
    try {
      const res = await fetch(`${API_URL}/players/${memberId}/join-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      if (res.ok) {
        const newPlayer = await res.json();
        // UI Sync: Update local state without a full page reload
        set((state) => ({ players: [...state.players, newPlayer] }));
      }
    } catch (e) { console.error(e); }
  },

  updateMember: async (memberId, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/players/member/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      if (res.ok) {
        get().fetchGlobalPlayers(); // Refresh the list
        return true;
      }
    } catch (e) { return false; }
  },

  // Session Player Logic
  addPlayer: async (p) => {
    const { sessionId } = get();
    await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, sessionId })
    });
    window.location.reload();
  },

  // Game/Match Logic
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

  updateGame: async (gameId, updatedData) => {
    const dbData = {
      type: updatedData.type,
      teamA: { set: updatedData.teamA.map(p => ({ id: p.id })) },
      teamB: { set: updatedData.teamB.map(p => ({ id: p.id })) }
    };
    await fetch(`${API_URL}/games/${gameId}`, {
      method: 'PATCH',
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
  },

  resetSession: async () => {
    const { sessionId } = get();
    if (!sessionId || !window.confirm("End session and clear board?")) return;
    try {
      await fetch(`${API_URL}/sessions/${sessionId}/complete`, { method: 'PATCH' });
      window.location.reload();
    } catch (e) { console.error(e); }
  }
}));

export default useQueueStore;
