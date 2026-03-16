import { create } from 'zustand';
import { io } from 'socket.io-client';

// Keep your Tailscale IP here!
const API_URL = 'http://100.88.175.25:3000'; // <-- Make sure this is your actual IP

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  players: [],
  pendingGames: [],
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Championship Court', activeGame: null }
  ],

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

      set({ 
        sessionId: currentSessionId, 
        players, 
        pendingGames, 
        courts: updatedCourts 
      });

      const socket = io(API_URL);
      socket.on('connect', () => {
        set({ isConnected: true, socket });
        socket.emit('joinSession', { sessionId: currentSessionId });
      });

      socket.on('disconnect', () => set({ isConnected: false }));

      socket.on('boardStateUpdated', (data) => {
        const { action, payload } = data;
        switch (action) {
          case 'ADD_PLAYER':
            set((state) => ({ players: [...state.players, payload] }));
            break;
          case 'DRAFT_GAME':
            set((state) => ({ pendingGames: [...state.pendingGames, payload] }));
            break;
          case 'ASSIGN_GAME':
            set({ pendingGames: payload.pendingGames, courts: payload.courts });
            break;
          case 'COMPLETE_GAME':
            set({ courts: payload.courts });
            break;
          case 'RESET_BOARD':
            window.location.reload(); // Quickest way to sync remote tablets to the fresh session
            break;
          default:
            console.warn('Unknown action:', action);
        }
      });

    } catch (error) {
      console.error("Failed to initialize session:", error);
    }
  },

  // --- NEW: End the current queue day and start fresh ---
  resetSession: async () => {
    const { sessionId, socket } = get();
    if (!sessionId) return;

    const confirmReset = window.confirm("Are you sure you want to end this session? This will clear the board and start a new Queue ID.");
    if (!confirmReset) return;

    try {
      // 1. Tell backend to mark session as COMPLETED
      await fetch(`${API_URL}/sessions/${sessionId}/complete`, {
        method: 'PATCH'
      });

      // 2. Clear out the local ghost data immediately
      set({
        sessionId: null,
        players: [],
        pendingGames: [],
        courts: [
          { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
          { id: 'c2', number: 2, name: 'Championship Court', activeGame: null }
        ]
      });

      // 3. Disconnect old socket
      if (socket) {
        socket.emit('updateBoardState', { sessionId, action: 'RESET_BOARD', payload: {} });
        socket.disconnect();
        set({ socket: null, isConnected: false });
      }

      // 4. Fire up a brand new session!
      await get().initSession();

    } catch (error) {
      console.error("Failed to reset session:", error);
      alert("Error ending session. Check backend connection.");
    }
  },

  addPlayer: async (newPlayer) => {
    const { sessionId, socket } = get();
    if (!sessionId) return;

    try {
      const response = await fetch(`${API_URL}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPlayer, sessionId })
      });
      const savedPlayer = await response.json();

      set((state) => ({ players: [...state.players, savedPlayer] }));
      if (socket) socket.emit('updateBoardState', { sessionId, action: 'ADD_PLAYER', payload: savedPlayer });
    } catch (error) {
      console.error("Failed to save player:", error);
    }
  },

  draftGame: async (newGameData) => {
    const { sessionId, socket } = get();
    if (!sessionId) return;

    try {
      const dbGameData = {
        session: { connect: { id: sessionId } },
        type: newGameData.type,
        status: 'PENDING',
        teamA: { connect: newGameData.teamA.map(p => ({ id: p.id })) },
        teamB: { connect: newGameData.teamB.map(p => ({ id: p.id })) }
      };

      const response = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbGameData)
      });

      if (!response.ok) {
        console.error("Backend error:", await response.text());
        alert("Failed to save game to database!");
        return; 
      }

      const savedGame = await response.json();
      set((state) => ({ pendingGames: [...state.pendingGames, savedGame] }));
      if (socket) socket.emit('updateBoardState', { sessionId, action: 'DRAFT_GAME', payload: savedGame });
    } catch (error) {
      console.error("Network failed to save game:", error);
    }
  },

  assignGameToCourt: async (gameId, courtId) => {
    const { sessionId, socket, pendingGames, courts } = get();
    
    const targetCourt = courts.find(c => c.id === courtId);
    if (targetCourt && targetCourt.activeGame) return alert("Court is occupied!");

    try {
      await fetch(`${API_URL}/games/${gameId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courtId })
      });

      const gameToMove = pendingGames.find(g => g.id === gameId);
      const updatedPending = pendingGames.filter(g => g.id !== gameId);
      
      const updatedCourts = courts.map(c => {
        if (c.id === courtId) return { ...c, activeGame: { ...gameToMove, startedAt: new Date().toISOString() } };
        return c;
      });

      const newState = { pendingGames: updatedPending, courts: updatedCourts };
      set(newState);

      if (socket) socket.emit('updateBoardState', { sessionId, action: 'ASSIGN_GAME', payload: newState });
    } catch (error) {
      console.error("Failed to assign game:", error);
    }
  },

  completeGame: async (courtId, gameId, resultData) => {
    const { sessionId, socket, courts } = get();

    try {
      await fetch(`${API_URL}/games/${gameId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      });

      const updatedCourts = courts.map(c => {
        if (c.id === courtId) return { ...c, activeGame: null };
        return c;
      });

      set({ courts: updatedCourts });

      if (socket) {
        socket.emit('updateBoardState', { 
          sessionId, 
          action: 'COMPLETE_GAME', 
          payload: { courts: updatedCourts } 
        });
      }
    } catch (error) {
      console.error("Failed to complete game:", error);
    }
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, sessionId: null });
    }
  }
}));

export default useQueueStore;
