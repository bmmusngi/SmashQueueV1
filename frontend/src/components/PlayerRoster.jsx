import React, { useState, useEffect } from 'react';
import { Search, UserPlus, CheckCircle, Edit3, Activity, Loader2 } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';
import EditMemberModal from './EditMemberModal';

export default function PlayerRoster() {
  const { 
    globalPlayers = [], 
    fetchGlobalPlayers, 
    inviteToSession, 
    players: sessionPlayers = [],
    sessionId
  } = useQueueStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [isInviting, setIsInviting] = useState(null); // Track which ID is being invited

  useEffect(() => {
    fetchGlobalPlayers();
  }, [fetchGlobalPlayers]);

  const handleInvite = async (id) => {
    setIsInviting(id);
    await inviteToSession(id);
    setIsInviting(null);
  };

  const filteredPlayers = Array.isArray(globalPlayers) ? globalPlayers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Roster Toolbar */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search global roster..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
           {sessionId === 'OFFLINE' && (
             <span className="text-[10px] font-black text-rose-500 uppercase animate-pulse">Offline Mode</span>
           )}
           <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">
             Total Members: {filteredPlayers.length}
           </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
            <tr className="text-[10px] uppercase text-slate-400 font-black tracking-widest">
              <th className="px-6 py-4">Member Name</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Record</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPlayers.map((player) => {
              // Check if member is already checked into the current session
              const isAdded = sessionPlayers.some(sp => sp.memberId === player.id);
              const loading = isInviting === player.id;

              return (
                <tr key={player.id} className={`transition-colors ${isAdded ? 'bg-emerald-50/40' : 'hover:bg-indigo-50/40'}`}>
                  <td className="px-6 py-4">
                    <div className={`font-bold ${isAdded ? 'text-emerald-800' : 'text-slate-800'}`}>{player.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{player.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-indigo-100 rounded text-[10px] font-black text-indigo-700 uppercase">
                      Level {player.levelWeight}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isAdded ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                        <CheckCircle size={14} /> Checked In
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase">Not in Session</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-[10px]">
                    <span className="text-emerald-600 mr-2">{player.wins}W</span>
                    <span className="text-rose-500">{player.losses}L</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <button onClick={() => setEditingMember(player)} className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                        <Edit3 size={16} />
                      </button>

                      <button 
                        onClick={() => !isAdded && handleInvite(player.id)}
                        disabled={isAdded || loading}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded font-black text-[10px] uppercase transition-all ${
                          isAdded 
                          ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        }`}
                      >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                        {isAdded ? 'In Session' : 'Check In'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EditMemberModal 
        isOpen={!!editingMember} 
        onClose={() => setEditingMember(null)} 
        member={editingMember} 
      />
    </div>
  );
}
