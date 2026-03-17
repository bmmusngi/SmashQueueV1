import React, { useState, useEffect } from 'react';
import { Search, UserPlus, CheckCircle, Edit3, Power, Activity, Loader2 } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';
import EditMemberModal from './EditMemberModal';

export default function PlayerRoster() {
  const { 
    globalPlayers = [], 
    fetchGlobalPlayers, 
    inviteToSession,
    updateMember, // Pulled updateMember from the store
    players: sessionPlayers = [],
    sessionId
  } = useQueueStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [isInviting, setIsInviting] = useState(null);
  const [isToggling, setIsToggling] = useState(null); // Track toggle state

  useEffect(() => {
    fetchGlobalPlayers();
  }, [fetchGlobalPlayers]);

  const handleInvite = async (id) => {
    setIsInviting(id);
    await inviteToSession(id);
    setIsInviting(null);
  };

  const handleToggleStatus = async (player) => {
    setIsToggling(player.id);
    // If isActive is undefined (older records), treat it as true
    const currentStatus = player.isActive !== false; 
    await updateMember(player.id, { isActive: !currentStatus });
    setIsToggling(null);
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
              const isAdded = sessionPlayers.some(sp => sp.memberId === player.id);
              const isInvitingLoading = isInviting === player.id;
              const isToggleLoading = isToggling === player.id;
              
              // Safely handle missing isActive flag for legacy records
              const isActiveMember = player.isActive !== false; 

              return (
                <tr 
                  key={player.id} 
                  className={`transition-colors ${
                    !isActiveMember ? 'bg-slate-50/50 opacity-60 grayscale-[0.5]' : 
                    isAdded ? 'bg-emerald-50/40' : 'hover:bg-indigo-50/40'
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className={`font-bold ${!isActiveMember ? 'text-slate-500 line-through' : isAdded ? 'text-emerald-800' : 'text-slate-800'}`}>
                      {player.name}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{player.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${!isActiveMember ? 'bg-slate-200 text-slate-500' : 'bg-indigo-100 text-indigo-700'}`}>
                      Level {player.levelWeight}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {!isActiveMember ? (
                      <span className="text-[10px] font-black text-rose-400 uppercase">Inactive</span>
                    ) : isAdded ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                        <CheckCircle size={14} /> Checked In
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase">Not in Session</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-[10px]">
                    <span className={`${!isActiveMember ? 'text-slate-400' : 'text-emerald-600'} mr-2`}>{player.wins}W</span>
                    <span className={!isActiveMember ? 'text-slate-400' : 'text-rose-500'}>{player.losses}L</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      
                      {/* Toggle Active/Inactive Button */}
                      <button 
                        onClick={() => handleToggleStatus(player)}
                        disabled={isToggleLoading}
                        className={`p-2 rounded-lg transition-all ${
                          !isActiveMember 
                          ? 'text-rose-500 hover:bg-rose-100' 
                          : 'text-emerald-500 hover:bg-emerald-50'
                        }`}
                        title={isActiveMember ? "Deactivate Member" : "Reactivate Member"}
                      >
                        {isToggleLoading ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
                      </button>

                      {/* Edit Button */}
                      <button 
                        onClick={() => setEditingMember(player)} 
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit3 size={16} />
                      </button>

                      {/* Add to Session Button */}
                      <button 
                        onClick={() => !isAdded && isActiveMember && handleInvite(player.id)}
                        disabled={isAdded || isInvitingLoading || !isActiveMember}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded font-black text-[10px] uppercase transition-all ${
                          !isActiveMember
                          ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                          : isAdded 
                          ? 'bg-emerald-100 text-emerald-700 cursor-default' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                        }`}
                      >
                        {isInvitingLoading ? <Loader2 size={14} className="animate-spin" /> : null}
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
