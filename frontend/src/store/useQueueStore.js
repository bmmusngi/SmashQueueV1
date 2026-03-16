import { create } from 'zustand';
import { io } from 'socket.io-client';

// Change this to your NAS IP later (e.g., http://192.168.1.100:3000)
const API_URL = 'http://100.88.175.25:3000'; 

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  
  // Start with empty arrays (Real data will load from DB)
  players: [],
  pendingGames: [],
  
  // Courts are physical and fixed, so we leave their empty structure here
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Championship Court', activeGame: null }
  ],

  // 1. Initialize App & Fetch Data
  initSession: async () => {
    if (get().socket) return; // Prevent double connections

    try {
      // Step A: Get or Create Active Session
      let sessionRes = await fetch(`${API_URL}/sessions/active`);
      let sessionText = await sessionRes.text();
      let session = sessionText ? JSON.parse(sessionText) : null;

      if (!session) {
        const createRes = await fetch(`${API_URL}/sessions`, { method: 'POST' });
        session = await createRes.json();
      }
      
      const currentSessionId = session.id;

      // Step B: Fetch Players and Games for this session
      const [playersRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`),
        fetch(`${API_URL}/games/session/${currentSessionId}`)
      ]);

      const players = await playersRes.json();
      const allGames = await gamesRes.json();

      // Step C: Sort games into Pending vs Active
      const pendingGames = allGames.filter(g => g.status === 'PENDING');
      const activeGames = allGames.filter(g => g.status === 'ACTIVE');

      // Populate courts with active games
      const updatedCourts = get().courts.map(court => {
        const gameOnThisCourt = activeGames.find(g => g.courtId === court.id);
        return { ...court, activeGame: gameOnThisCourt || null };
      });

      // Update Local State
      set({ 
        sessionId: currentSessionId, 
        players, 
        pendingGames, 
        courts: updatedCourts 
      });

      // Step D: Connect WebSocket for real-time sync
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
          default:
            console.warn('Unknown board action received:', action);
        }
      });

    } catch (error) {
      console.error("Failed to initialize session from backend:", error);
    }
  },

  // 2. Add Player (Save to DB first)
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

      // Update UI and Broadcast
      set((state) => ({ players: [...state.players, savedPlayer] }));
      if (socket) socket.emit('updateBoardState', { sessionId, action: 'ADD_PLAYER', payload: savedPlayer });
    } catch (error) {
      console.error("Failed to save player:", error);
    }
  },

  // 3. Draft Game (Save to DB first)
  draftGame: async (newGameData) => {
    const { sessionId, socket } = get();
    if (!sessionId) return;

    try {
      // FIX: Use Prisma's strict relation formatting for ALL linked tables
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

      // Catch the error so we don't render a blank card!
      if (!response.ok) {
        console.error("Backend error:", await response.text());
        alert("Failed to save game to database!");
        return; 
      }

      const savedGame = await response.json();

      // Update UI with the game directly from the database
      set((state) => ({ pendingGames: [...state.pendingGames, savedGame] }));
      if (socket) socket.emit('updateBoardState', { sessionId, action: 'DRAFT_GAME', payload: savedGame });
    } catch (error) {
      console.error("Network failed to save game:", error);
    }
  },

  // 4. Assign to Court (Update DB first)
  assignGameToCourt: async (gameId, courtId) => {
    const { sessionId, socket, pendingGames, courts } = get();
    
    // Safety check
    const targetCourt = courts.find(c => c.id === courtId);
    if (targetCourt && targetCourt.activeGame) return alert("Court is occupied!");

    try {
      // Tell backend to update the game status
      await fetch(`${API_URL}/games/${gameId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courtId })
      });

      // Update local state
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

  // 5. Complete Game (Clear court and log shuttles)
  completeGame: async (courtId, gameId, resultData) => {
    const { sessionId, socket, courts } = get();

    try {
      // 1. Send the result to the NestJS Backend
      await fetch(`${API_URL}/games/${gameId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      });

      // 2. Clear the active game from the local court state
      const updatedCourts = courts.map(c => {
        if (c.id === courtId) return { ...c, activeGame: null };
        return c;
      });

      // 3. Update UI
      set({ courts: updatedCourts });

      // 4. Broadcast the freed-up court to other tablets
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

  // Cleanup
  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, sessionId: null });
    }
  }
}));

export default useQueueStore;
