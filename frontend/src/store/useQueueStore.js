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
  courts: [], // Now starts empty and loads from DB

  // --- UI NAVIGATION ---
  setView: (view) => set({ currentView: view }),

  // --- INITIALIZATION ---
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

      // 2. Parallel Data Fetch
      const [playersRes, gamesRes, courtsRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`),
        fetch(`${API_URL}/games/session/${currentSessionId}`),
        fetch(`${API_URL}/courts`) // Fetch dynamic courts
      ]);

      const players = (await playersRes.json()) || [];
      const allGames = (await gamesRes.json()) || [];
      const dbCourts = (await courtsRes.json()) || [];

      const pendingGames = allGames.filter(g => g?.status === 'PENDING');
      const activeGames = allGames.filter(g => g?.status === 'ACTIVE');

      // 3. Map Games to Dynamic Courts
      const updatedCourts = dbCourts.map(court => {
        const gameOnThisCourt = activeGames.find(g => g.courtId === court.id);
        return { ...court, activeGame: gameOnThisCourt || null };
      });

      set({ 
        sessionId: currentSessionId, 
        players, 
        pendingGames, 
        courts: updatedCourts 
      });

      // 4. Socket.io Handshake
      const socket = io(API_URL);
      socket.on('connect', () => {
        set({ isConnected: true, socket });
        socket.emit('joinSession', { sessionId: currentSessionId });
      });

      socket.on('boardStateUpdated', (data) => {
        // Handle global refreshes vs partial syncs
        if (data.action === 'REFRESH_ALL' || data.action === 'RESET_BOARD') {
           window.location.reload();
        } else {
           // Silently re-fetch board state to keep in sync
           const sync = async () => {
             const [p, g, c] = await Promise.all([
               fetch(`${API_URL}/players/session/${currentSessionId}`).then(r => r.json()),
               fetch(`${API_URL}/games/session/${currentSessionId}`).then(r => r.json()),
               fetch(`${API_URL}/courts`).then(r => r.json())
             ]);
             
             const active = g.filter(x => x.status === 'ACTIVE');
             const mappedCourts = c.map(ct => ({
               ...ct,
               activeGame: active.find(gm => gm.courtId === ct.id) || null
             }));

             set({ 
               players: p, 
               pendingGames: g.filter(x => x.status === 'PENDING'),
               courts: mappedCourts
             });
           };
           sync();
        }
      });

    } catch (error) { 
      console.error("Init error:", error);
      set({ sessionId: 'OFFLINE' });
    }
  },

  // --- COURT MANAGEMENT ---
  fetchCourts: async () => {
    try {
      const res = await fetch(`${API_URL}/courts`);
      const data = await res.json();
      set({ courts: Array.isArray(data) ? data : [] });
    } catch (e) { console.error("Court fetch error:", e); }
  },

  addCourt: async (name) => {
    const { courts } = get();
    try {
      await fetch(`${API_URL}/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, number: courts.length + 1 })
      });
      get().initSession(); // Re-run init to map everything correctly
    } catch (e) { console.error(e); }
  },

  renameCourt: async (id, name) => {
    try {
      await fetch(`${API_URL}/courts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      get().initSession();
    } catch (e) { console.error(e); }
  },

  removeCourt: async (id) => {
    if (!window.confirm("Remove this court?")) return;
    try {
      await fetch(`${API_URL}/courts/${id}`, { method: 'DELETE' });
      get().initSession();
    } catch (e) { console.error(e); }
  },

  // --- MEMBER & ROSTER ---
  fetchGlobalPlayers: async () => {
    try {
      const res = await fetch(`${API_URL}/players/global`);
      const data = await res.json();
      set({ globalPlayers: Array.isArray(data) ? data : [] });
    } catch (e) { console.error(e); }
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
        get().fetchGlobalPlayers();
        return true;
      }
    } catch (e) { return false; }
  },

  // --- CORE GAME ACTIONS ---
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
