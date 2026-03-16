import { create } from 'zustand';
import { io } from 'socket.io-client';

// Keep your Tailscale IP!
const API_URL = 'http://100.88.175.25:3000'; 



const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  players: [],
  pendingGames: [],
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Court 2', activeGame: null },
    { id: 'c3', number: 3, name: 'Court 3', activeGame: null },
    { id: 'c4', number: 4, name: 'Court 4', activeGame: null },
  ],
  currentView: 'LIVE_QUEUE', // Possible values: 'LIVE_QUEUE', 'PLAYER_ROSTER', 'HISTORY', 'REPORTS'
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
      socket.on('disconnect', () => set({ isConnected: false }));
      socket.on('boardStateUpdated', (data) => {
        const { action, payload } = data;
        switch (action) {
          case 'ADD_PLAYER': set((state) => ({ players: [...state.players, payload] })); break;
          case 'DRAFT_GAME': set((state) => ({ pendingGames: [...state.pendingGames, payload] })); break;
          case 'ASSIGN_GAME': set({ pendingGames: payload.pendingGames, courts: payload.courts }); break;
          case 'COMPLETE_GAME': set({ courts: payload.courts }); break;
          case 'RESET_BOARD': window.location.reload(); break;
        }
      });
    } catch (error) { console.error("Init error:", error); }
  },

  resetSession: async () => {
    const { sessionId, socket } = get();
    if (!sessionId || !window.confirm("End session and start fresh?")) return;
    try {
      await fetch(`${API_URL}/sessions/${sessionId}/complete`, { method: 'PATCH' });
      set({ sessionId: null, players: [], pendingGames: [] });
      if (socket) {
        socket.emit('updateBoardState', { sessionId, action: 'RESET_BOARD', payload: {} });
        socket.disconnect();
        set({ socket: null });
      }
      await get().initSession();
    } catch (error) { console.error("Reset error:", error); }
  },

  addPlayer: async (p) => {
    const { sessionId, socket } = get();
    const res = await fetch(`${API_URL}/players`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...p, sessionId })
    });
    const saved = await res.json();
    set((s) => ({ players: [...s.players, saved] }));
    if (socket) socket.emit('updateBoardState', { sessionId, action: 'ADD_PLAYER', payload: saved });
  },

  draftGame: async (data) => {
    const { sessionId, socket } = get();
    const dbData = {
      session: { connect: { id: sessionId } },
      type: data.type,
      status: 'PENDING',
      teamA: { connect: data.teamA.map(p => ({ id: p.id })) },
      teamB: { connect: data.teamB.map(p => ({ id: p.id })) }
    };
    const res = await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });
    const saved = await res.json();
    set((s) => ({ pendingGames: [...s.pendingGames, saved] }));
    if (socket) socket.emit('updateBoardState', { sessionId, action: 'DRAFT_GAME', payload: saved });
  },

  assignGameToCourt: async (gameId, courtId) => {
    const { sessionId, socket, pendingGames, courts } = get();
    await fetch(`${API_URL}/games/${gameId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courtId })
    });
    const game = pendingGames.find(g => g.id === gameId);
    const updatedPending = pendingGames.filter(g => g.id !== gameId);
    const updatedCourts = courts.map(c => c.id === courtId ? { ...c, activeGame: { ...game, startedAt: new Date().toISOString() } } : c);
    const newState = { pendingGames: updatedPending, courts: updatedCourts };
    set(newState);
    if (socket) socket.emit('updateBoardState', { sessionId, action: 'ASSIGN_GAME', payload: newState });
  },

  // FINALIZED: Complete Game logic
  completeGame: async (courtId, gameId, resultData) => {
    const { sessionId, socket, courts } = get();
    try {
      await fetch(`${API_URL}/games/${gameId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      });
      const updatedCourts = courts.map(c => c.id === courtId ? { ...c, activeGame: null } : c);
      set({ courts: updatedCourts });
      if (socket) socket.emit('updateBoardState', { sessionId, action: 'COMPLETE_GAME', payload: { courts: updatedCourts } });
    } catch (error) { console.error("Complete error:", error); }
  }
}));

export default useQueueStore;
