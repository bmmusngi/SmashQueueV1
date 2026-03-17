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
  
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Court 2', activeGame: null }
  ],

  // --- UI NAVIGATION ---
  setView: (view) => set({ currentView: view }),

  // --- INITIALIZATION ---
  initSession: async () => {
    if (get().socket) return; 

    try {
      const sessionRes = await fetch(`${API_URL}/sessions/active`).catch(() => null);
      if (!sessionRes || !sessionRes.ok) throw new Error("Backend not responding");
      
      const sessionText = await sessionRes.text();
      let session = sessionText ? JSON.parse(sessionText) : null;

      if (!session) {
        const createRes = await fetch(`${API_URL}/sessions`, { method: 'POST' });
        session = await createRes.json();
      }
      
      const currentSessionId = session?.id;

      // Fetch Players, Global Roster, AND Games
      const [playersRes, globalRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}/players/global`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}/games/session/${currentSessionId}`).catch(() => ({ json: () => [] }))
      ]);

      const players = (await playersRes.json()) || [];
      const globalPlayers = (await globalRes.json()) || [];
      const allGames = (await gamesRes.json()) || [];

      // Sort games for the UI
      const pendingGames = Array.isArray(allGames) ? allGames.filter(g => g?.status === 'PENDING') : [];
      const activeGames = Array.isArray(allGames) ? allGames.filter(g => g?.status === 'ACTIVE') : [];

      // Assign active games to the correct courts
      const updatedCourts = (get().courts || []).map(court => {
        const gameOnThisCourt = activeGames.find(g => g?.courtId === court?.id);
        return { ...court, activeGame: gameOnThisCourt || null };
      });

      set({ 
        sessionId: currentSessionId, 
        players, 
        globalPlayers,
        pendingGames,
        courts: updatedCourts
      });

      const socket = io(API_URL);
      socket.on('connect', () => {
        set({ isConnected: true, socket });
        socket.emit('joinSession', { sessionId: currentSessionId });
      });

      socket.on('boardStateUpdated', () => get().initSession());

    } catch (error) { 
      console.error("Init error:", error);
      set({ sessionId: 'OFFLINE' });
    }
  },

  // --- GLOBAL ROSTER LOGIC ---
  fetchGlobalPlayers: async () => {
    try {
      const res = await fetch(`${API_URL}/players/global`);
      const data = await res.json();
      set({ globalPlayers: Array.isArray(data) ? data : [] });
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

  // --- SESSION PLAYER LOGIC ---
  inviteToSession: async (memberId) => {
    const { sessionId } = get();
    if (!sessionId || sessionId === 'OFFLINE') return alert("No active session found.");

    try {
      const res = await fetch(`${API_URL}/players/${memberId}/join-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (res.ok) {
        const newPlayer = await res.json();
        set((state) => ({ players: [...state.players, newPlayer] }));
      } else {
        alert("Failed to add player.");
      }
    } catch (e) { console.error(e); }
  },

  toggleSessionPlayerStatus: async (playerId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`${API_URL}/players/${playerId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updatedPlayer = await res.json();
        set((state) => ({
          players: state.players.map(p => p.id === playerId ? { ...p, ...updatedPlayer } : p)
        }));
      }
    } catch (e) { console.error(e); }
  },

  removeSessionPlayer: async (playerId) => {
    if (!window.confirm("Remove this player from the current session?")) return;
    try {
      const res = await fetch(`${API_URL}/players/${playerId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        set((state) => ({ players: state.players.filter(p => p.id !== playerId) }));
      } else {
        const err = await res.text();
        alert(JSON.parse(err).message || "Failed to remove player."); 
      }
    } catch (e) { console.error(e); }
  },

  // --- GAME & MATCH LOGIC ---
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
