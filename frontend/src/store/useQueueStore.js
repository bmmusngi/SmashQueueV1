import { create } from 'zustand';
import { io } from 'socket.io-client';

// Ensure this is your actual Tailscale IP
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
    // Only init once
    if (get().socket) return; 

    try {
      console.log("Starting session init...");
      
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

      // Defensive Parsing: Ensure we always have arrays
      const players = (await playersRes.json()) || [];
      const allGames = (await gamesRes.json()) || [];

      const pendingGames = allGames.filter(g => g?.status === 'PENDING');
      const activeGames = allGames.filter(g => g?.status === 'ACTIVE');

      // 3. Map Games to Courts
      const currentCourts = get().courts || [];
      const updatedCourts = currentCourts.map(court => {
        const gameOnThisCourt = activeGames.find(g => g.courtId === court.id);
        return { ...court, activeGame: gameOnThisCourt || null };
      });

      // 4. Set State
      set({ 
        sessionId: currentSessionId, 
        players, 
        pendingGames, 
        courts: updatedCourts 
      });

      // 5. Connect Socket
      const socket = io(API_URL);
      socket.on('connect', () => {
        set({ isConnected: true, socket });
        socket.emit('joinSession', { sessionId: currentSessionId });
      });

      socket.on('boardStateUpdated', (data) => {
        if (data.action === 'REFRESH_ALL' || data.action === 'RESET_BOARD') {
           window.location.reload();
        } else {
           // Silently re-fetch data to keep in sync
           const sync = async () => {
             const pRes = await fetch(`${API_URL}/players/session/${currentSessionId}`);
             const gRes = await fetch(`${API_URL}/games/session/${currentSessionId}`);
             set({ players: await pRes.json(), pendingGames: (await gRes.json()).filter(g => g.status === 'PENDING') });
           };
           sync();
        }
      });

    } catch (error) { 
      console.error("Init error:", error);
      // Don't leave the Session ID as "..." if it fails
      set({ sessionId: 'OFFLINE' });
    }
  },

  fetchGlobalPlayers: async () => {
    try {
      const res = await fetch(`${API_URL}/players/global`);
      const data = await res.json();
      set({ globalPlayers: Array.isArray(data) ? data : [] });
    } catch (e) { console.error("Global fetch error:", e); }
  },

  inviteToSession: async (memberId) => {
    const { sessionId } = get();
    try {
      await fetch(`${API_URL}/players/${memberId}/join-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      window.location.reload();
    } catch (e) { console.error(e); }
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
    if (!sessionId || !window.confirm("End session and clear board?")) return;
    try {
      await fetch(`${API_URL}/sessions/${sessionId}/complete`, { method: 'PATCH' });
      window.location.reload();
    } catch (e) { console.error(e); }
  },

  // ... (All other functions follow the same pattern of window.location.reload() for now to ensure sync)
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
  },
  
  updateGame: async (gameId, updatedData) => {
    const { sessionId } = get();
    try {
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
      
      window.location.reload(); // Keep it simple and synced
    } catch (e) {
      console.error("Update game error:", e);
    }
  }

  
}));

export default useQueueStore;
