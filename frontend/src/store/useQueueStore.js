import { create } from 'zustand';
import { io } from 'socket.io-client';

const API_URL = 'http://100.88.175.25:3000'; 

const useQueueStore = create((set, get) => ({
  sessionId: null,
  socket: null,
  isConnected: false,
  currentView: 'LIVE_QUEUE',
  players: [],        // Session-specific players
  globalPlayers: [],  // Global roster
  pendingGames: [],
  
  courts: [
    { id: 'c1', number: 1, name: 'Court 1', activeGame: null },
    { id: 'c2', number: 2, name: 'Court 2', activeGame: null }
  ],

  setView: (view) => set({ currentView: view }),

  // INITIALIZATION
  initSession: async () => {
    if (get().socket) return; 

    try {
      const sessionRes = await fetch(`${API_URL}/sessions/active`);
      if (!sessionRes.ok) throw new Error("Backend not responding");
      
      const sessionText = await sessionRes.text();
      let session = sessionText ? JSON.parse(sessionText) : null;

      if (!session) {
        const createRes = await fetch(`${API_URL}/sessions`, { method: 'POST' });
        session = await createRes.json();
      }
      
      const currentSessionId = session.id;

      // Fetch both Global Roster and Session Players immediately
      const [playersRes, globalRes] = await Promise.all([
        fetch(`${API_URL}/players/session/${currentSessionId}`),
        fetch(`${API_URL}/players/global`)
      ]);

      set({ 
        sessionId: currentSessionId, 
        players: (await playersRes.json()) || [],
        globalPlayers: (await globalRes.json()) || []
      });

      // Socket setup
      const socket = io(API_URL);
      socket.on('connect', () => set({ isConnected: true, socket }));
      
      socket.on('boardStateUpdated', () => get().initSession());

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
  
    // SOFT DELETE: Toggle player status in the live session
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
        // Update local state to reflect the new status
        set((state) => ({
          players: state.players.map(p => p.id === playerId ? { ...p, ...updatedPlayer } : p)
        }));
      }
    } catch (e) {
      console.error("Status Toggle Error:", e);
      alert("Failed to update player status.");
    }
  },

  // HARD DELETE: Remove a mistakenly added player
  removeSessionPlayer: async (playerId) => {
    if (!window.confirm("Remove this player from the current session?")) return;

    try {
      const res = await fetch(`${API_URL}/players/${playerId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        // Remove them from the local session list
        set((state) => ({
          players: state.players.filter(p => p.id !== playerId)
        }));
      } else {
        const err = await res.text();
        // This will display the "Cannot remove a player who has already..." message
        alert(JSON.parse(err).message || "Failed to remove player."); 
      }
    } catch (e) {
      console.error("Delete Error:", e);
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
    } catch (e) { return false; }
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
