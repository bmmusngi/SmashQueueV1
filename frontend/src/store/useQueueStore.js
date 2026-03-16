import { create } from 'zustand';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3000';

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  
  // --- DUMMY DATA ---
  players: [
    { id: 'p1', name: 'Ben', levelWeight: 3, gender: 'M', status: 'ACTIVE', paymentStatus: 'PAID', paymentMode: 'GCash' },
    { id: 'p2', name: 'Joel', levelWeight: 4, gender: 'M', status: 'ACTIVE', paymentStatus: 'UNPAID' },
    { id: 'p3', name: 'Axel', levelWeight: 2, gender: 'M', status: 'ACTIVE', paymentStatus: 'PAID', paymentMode: 'Cash' },
    { id: 'p4', name: 'Henry', levelWeight: 1, gender: 'M', status: 'RESTING', paymentStatus: 'PAID', paymentMode: 'QRPH' },
    { id: 'p5', name: 'Kagami', levelWeight: 5, gender: 'M', status: 'ACTIVE', paymentStatus: 'PAID', paymentMode: 'Cash' }
  ],
  pendingGames: [
    {
      id: 'g1', type: 'DOUBLES',
      teamA: [{ id: 'p6', name: 'Osamu', levelWeight: 2 }, { id: 'p7', name: 'Yuuichi', levelWeight: 5 }],
      teamB: [{ id: 'p8', name: 'Furihata', levelWeight: 1 }, { id: 'p9', name: 'Taiga', levelWeight: 4 }]
    }
  ],
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Championship Court', activeGame: {
      id: 'g2', type: 'SINGLES', startedAt: new Date(Date.now() - 600000).toISOString(), 
      teamA: [{ id: 'p10', name: 'Coach', levelWeight: 5 }],
      teamB: [{ id: 'p11', name: 'Challenger', levelWeight: 3 }]
    }}
  ],
  // ------------------

  initSession: (sessionId) => {
    if (get().socket) return;
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      set({ isConnected: true, sessionId, socket });
      socket.emit('joinSession', { sessionId });
    });

    socket.on('disconnect', () => {
      set({ isConnected: false });
    });

    socket.on('boardStateUpdated', (data) => {
      const { action, payload } = data;
      switch (action) {
        case 'SYNC_FULL_STATE':
          set({ players: payload.players, pendingGames: payload.pendingGames, courts: payload.courts });
          break;
        case 'ADD_PLAYER':
          set((state) => ({ players: [...state.players, payload] }));
          break;
        case 'DRAFT_GAME':
          set((state) => ({ pendingGames: [...state.pendingGames, payload] }));
          break;
        case 'ASSIGN_GAME':
          set((state) => ({ pendingGames: payload.pendingGames, courts: payload.courts }));
          break;
        default:
          console.warn('Unknown board action received:', action);
      }
    });
  },

  addPlayer: (newPlayer) => {
    const playerWithId = { id: Date.now().toString(), ...newPlayer };
    set((state) => ({ players: [...state.players, playerWithId] }));
    
    const { socket, sessionId } = get();
    if (socket && sessionId) {
      socket.emit('updateBoardState', { sessionId, action: 'ADD_PLAYER', payload: playerWithId });
    }
  },

  draftGame: (newGame) => {
    set((state) => ({ pendingGames: [...state.pendingGames, newGame] }));
    
    const { socket, sessionId } = get();
    if (socket && sessionId) {
      socket.emit('updateBoardState', { sessionId, action: 'DRAFT_GAME', payload: newGame });
    }
  },

  assignGameToCourt: (gameId, courtId) => {
    set((state) => {
      // 1. Find the game we are trying to move
      const gameToMove = state.pendingGames.find(g => g.id === gameId);
      if (!gameToMove) return state; // Safety check

      // 2. Check if the court already has an active game
      const targetCourt = state.courts.find(c => c.id === courtId);
      if (targetCourt && targetCourt.activeGame) {
        alert("This court is already occupied! Complete the current game first.");
        return state;
      }

      // 3. Remove game from pending list
      const updatedPending = state.pendingGames.filter(g => g.id !== gameId);

      // 4. Attach game to the court and stamp the start time for the timer
      const updatedCourts = state.courts.map(c => {
        if (c.id === courtId) {
          return { 
            ...c, 
            activeGame: { ...gameToMove, startedAt: new Date().toISOString() } 
          };
        }
        return c;
      });

      const newState = { pendingGames: updatedPending, courts: updatedCourts };

      // 5. Broadcast the change to other tablets
      const { socket, sessionId } = get();
      if (socket && sessionId) {
        socket.emit('updateBoardState', { sessionId, action: 'ASSIGN_GAME', payload: newState });
      }

      return newState;
    });
  },

  completeGame: (courtId, resultData) => {
    console.log(`Completing game on court ${courtId} with results:`, resultData);
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
