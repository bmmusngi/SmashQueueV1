import { create } from 'zustand';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  currentView: 'LIVE_QUEUE', // Can be: LIVE_QUEUE, PLAYER_MANAGEMENT, SESSION_HISTORY, ATTENDANCE_REPORT, GAME_HISTORY_REPORT
  players: [],        // Session-specific players
  globalPlayers: [],  // Global roster
  pendingGames: [],
  completedGames: [],
  
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Court 2', activeGame: null },
    { id: 'c3', number: 3, name: 'Court 3', activeGame: null }, 
    { id: 'c4', number: 4, name: 'Court 4', activeGame: null },
  ],

  setView: (view) => set({ currentView: view }),

    // INITIALIZATION
  initSession: async () => {
    // REMOVED the socket trap from here!

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

      // THE FIX: Fetch Players, Global Roster, AND Games simultaneously
      const [playersRes, globalRes, gamesRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}/players/global`).catch(() => ({ json: () => [] })),
        fetch(`${API_URL}/games/session/${currentSessionId}`).catch(() => ({ json: () => [] })) // <-- ADDED THIS
      ]);

      const players = (await playersRes.json()) || [];
      const globalPlayers = (await globalRes.json()) || [];
      const allGames = (await gamesRes.json()) || []; // <-- PARSED GAMES

      // Sort games for the UI
      const pendingGames = Array.isArray(allGames) ? allGames.filter(g => g?.status === 'PENDING') : [];
      const activeGames = Array.isArray(allGames) ? allGames.filter(g => g?.status === 'ACTIVE') : [];
      const completedGames = Array.isArray(allGames) ? allGames.filter(g => g.status === 'COMPLETED') : [];

      // Assign active games to the correct courts
      const updatedCourts = (get().courts || []).map(court => {
        const gameOnThisCourt = activeGames.find(g => g?.courtId === court?.id);
        return { ...court, activeGame: gameOnThisCourt || null };
      });

      // Inject EVERYTHING into the frontend state
      set({ 
        sessionId: currentSessionId, 
        players, 
        globalPlayers,
        pendingGames, // <-- NOW IT POPULATES
        completedGames,
        courts: updatedCourts
      });

      // ONLY setup the socket connection if we haven't already
      if (!get().socket) {
        const socket = io(API_URL);
        socket.on('connect', () => {
          set({ isConnected: true, socket });
          socket.emit('joinSession', { sessionId: currentSessionId });
        });
        
        // Listen for updates from other devices
        socket.on('boardStateUpdated', () => get().initSession());
      }

    } catch (error) { 
      console.error("Init error:", error);
      set({ sessionId: 'OFFLINE' });
    }
  },

  fetchGlobalPlayers: async () => {
    try {
      const res = await fetch(`${API_URL}/players/global`);
      const data = await res.json();
      set({ globalPlayers: Array.isArray(data) ? data : [] });
    } catch (e) { console.error(e); }
  },

  // THE FIX: Inviting a member to the current session
  inviteToSession: async (memberId) => {
    const { sessionId } = get();
    
    if (!sessionId || sessionId === 'OFFLINE') {
      alert("Error: No active session found. Please refresh.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/players/${memberId}/join-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });

      if (res.ok) {
        const newPlayer = await res.json();
        // Update local state immediately for a snappy UI
        set((state) => ({ 
          players: [...state.players, newPlayer] 
        }));
      } else {
        const errText = await res.text();
        alert(`Failed to add player: ${errText}`);
      }
    } catch (e) { 
      console.error("Invite Error:", e);
      alert("Connection error while adding player.");
    }
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
    } catch (e) { console.error("Update member error:", e); return false; }
  },
  
  // --- BULK OPERATIONS ---
  
  bulkUpload: async (players, target) => {
    // Stub implementation to prevent UI crash. 
    // Needs backend endpoint implementation (e.g. POST /players/bulk)
    console.log(`[Mock] Uploading ${players.length} players to ${target}`);
    // Example implementation:
    // const endpoint = target === 'GLOBAL' ? '/players/global/bulk' : `/players/session/${get().sessionId}/bulk`;
    // const res = await fetch(`${API_URL}${endpoint}`, { method: 'POST', body: JSON.stringify(players) ... });
    // if (res.ok) get().initSession();
    return true; 
  },

    // --- MATCHMAKING LOGIC ---
  
  draftGame: async (matchData) => {
    const { sessionId } = get();
    
    if (!sessionId || sessionId === 'OFFLINE') {
      alert("Cannot draft match: No active session found.");
      return;
    }

    // Format the payload exactly how the backend Prisma expects it
    const dbPayload = {
      sessionId: sessionId,
      type: matchData.type || 'DOUBLES',
      status: 'PENDING',
      teamAIds: matchData.teamA.map(p => p.id),
      teamBIds: matchData.teamB.map(p => p.id)
    };

    try {
      const res = await fetch(`${API_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });

      if (res.ok) {
        // Success! Reload the board to show the new pending match
        get().initSession();
      } else {
        const errText = await res.text();
        alert(`Failed to draft match: ${errText}`);
      }
    } catch (error) {
      console.error("Draft Error:", error);
      alert("Network error while drafting match.");
    }
  },

  updateGame: async (gameId, matchData) => {
    const dbPayload = {
      type: matchData.type,
      teamAIds: matchData.teamA.map(p => p.id),
      teamBIds: matchData.teamB.map(p => p.id)
    };

    try {
      const res = await fetch(`${API_URL}/games/${gameId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dbPayload)
      });

      if (res.ok) {
        get().initSession();
      } else {
        const errText = await res.text();
        alert(`Failed to update match: ${errText}`);
      }
    } catch (error) {
      console.error("Update Error:", error);
    }
  },

    assignGameToCourt: async (gameId, courtId) => {
    try {
      const res = await fetch(`${API_URL}/games/${gameId}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courtId })
      });

      if (res.ok) {
        // Success! Reload the board to move the game from Pending to the Court
        get().initSession();
      } else {
        const errText = await res.text();
        alert(`Failed to assign court: ${errText}`);
      }
    } catch (error) {
      console.error("Assign Error:", error);
      alert("Network error while assigning to court.");
    }
  },

  completeGame: async (courtId, gameId, resultData) => {
    console.log(`Completing game ${gameId} on court ${courtId}`);
    try {
      const res = await fetch(`${API_URL}/games/${gameId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultData)
      });

      if (res.ok) {
        // Success! Fetch the fresh data to instantly clear the court on the UI
        get().initSession();
      } else {
        // Catch backend rejections
        const errText = await res.text();
        alert(`Failed to complete game: ${errText}`);
      }
    } catch (error) {
      console.error("Complete Game Error:", error);
      alert("Network error while completing the game.");
    }
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
