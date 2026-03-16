import { create } from 'zustand';
import { io } from 'socket.io-client';

const API_URL = 'http://100.88.175.25:3000'; 

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  currentView: 'LIVE_QUEUE',
  players: [],
  globalPlayers: [],
  pendingGames: [],
  
  // FIXED: Standardized hardcoded courts
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Championship Court', activeGame: null }
  ],

  setView: (view) => set({ currentView: view }),

  initSession: async () => {
    if (get().socket) return; 

    try {
      const sessionRes = await fetch(`${API_URL}/sessions/active`).catch(() => null);
      if (!sessionRes || !sessionRes.ok) {
        set({ sessionId: 'OFFLINE' });
        return;
      }
      
      const sessionText = await sessionRes.text();
      let session = sessionText ? JSON.parse(sessionText) : null;

      if (!session) {
        const createRes = await fetch(`${API_URL}/sessions`, { method: 'POST' });
        session = await createRes.json();
      }
      
      const currentSessionId = session?.id;

      const [playersRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}/games/session/${currentSessionId}`).catch(() => ({ json: () => [] }))
      ]);

      // SAFE FALLBACKS: Ensures these are ALWAYS arrays even if fetch fails
      const players = (await playersRes.json()) || [];
      const allGames = (await gamesRes.json()) || [];

      const pendingGames = Array.isArray(allGames) ? allGames.filter(g => g?.status === 'PENDING') : [];
      const activeGames = Array.isArray(allGames) ? allGames.filter(g => g?.status === 'ACTIVE') : [];

      // SAFE MAP: Prevents crashes if courts array is somehow modified
      const updatedCourts = (get().courts || []).map(court => {
        const gameOnThisCourt = activeGames.find(g => g?.courtId === court?.id);
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

      socket.on('boardStateUpdated', (data) => {
        if (data?.action === 'REFRESH_ALL' || data?.action === 'RESET_BOARD') {
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

  // ... (Other methods: fetchGlobalPlayers, inviteToSession, etc. remain the same)
  // Just ensure any .map() inside them has a fallback like (data || [])
  
  draftGame: async (data) => {
    const { sessionId } = get();
    const dbData = {
      session: { connect: { id: sessionId } },
      type: data.type,
      status: 'PENDING',
      teamA: { connect: (data.teamA || []).map(p => ({ id: p.id })) },
      teamB: { connect: (data.teamB || []).map(p => ({ id: p.id })) }
    };
    await fetch(`${API_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbData)
    });
    window.location.reload();
  },

  // ... (Remaining methods follow the same safety pattern)
}));

export default useQueueStore;
