import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Trophy, Activity } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function PlayerRoster() {
  const { 
    globalPlayers = [], // Default to empty array to prevent .filter() crashes
    fetchGlobalPlayers, 
    inviteToSession, 
    players: sessionPlayers = [] 
  } = useQueueStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (fetchGlobalPlayers) {
      fetchGlobalPlayers();
    }
  }, [fetchGlobalPlayers]);

  // Safe Filtering: Ensure globalPlayers is an array before filtering
  const filteredPlayers = Array.isArray(globalPlayers) ? globalPlayers.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const alreadyInSession = sessionPlayers.some(sp => sp.memberId === p.id || sp.name === p.name);
    return matchesSearch && !alreadyInSession;
  }) : [];

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
        <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">
          Members Available: {filteredPlayers.length}
        </div>
      </div>

      {/* Roster Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
            <tr className="text-[10px] uppercase text-slate-400 font-black tracking-widest">
              <th className="px-6 py-4">Member Name</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Record (W/L/T)</th>
              <th className="px-6 py-4">Total Games</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player) => (
                <tr key={player.id} className="hover:bg-indigo-50/40 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{player.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-tighter">{player.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-indigo-100 rounded text-[10px] font-black text-indigo-700 uppercase">
                      Level {player.levelWeight}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold">
                      <span className="text-emerald-600">{player.wins || 0}W</span>
                      <span className="text-rose-500">{player.losses || 0}L</span>
                      <span className="text-slate-400">{player.ties || 0}T</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                    {(player.wins || 0) + (player.losses || 0) + (player.ties || 0)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => inviteToSession(player.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded font-black text-[10px] uppercase hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
                    >
                      <UserPlus size={14} /> Add to Court
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center opacity-20">
                    <Activity size={48} />
                    <p className="mt-2 font-black italic uppercase tracking-tighter">No Members Found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
