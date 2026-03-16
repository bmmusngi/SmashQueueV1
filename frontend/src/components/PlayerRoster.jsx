import React, { useState, useEffect } from 'react';
import { Search, UserPlus, CheckCircle, Activity } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function PlayerRoster() {
  const { 
    globalPlayers = [], 
    fetchGlobalPlayers, 
    inviteToSession, 
    players: sessionPlayers = [] 
  } = useQueueStore();
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGlobalPlayers();
  }, [fetchGlobalPlayers]);

  // Filter based ONLY on search term now
  const filteredPlayers = globalPlayers.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
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
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
            <tr className="text-[10px] uppercase text-slate-400 font-black tracking-widest">
              <th className="px-6 py-4">Member Name</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPlayers.map((player) => {
              // Check if they are already in the session
              const isAdded = sessionPlayers.some(sp => sp.memberId === player.id);

              return (
                <tr key={player.id} className={`transition-colors ${isAdded ? 'bg-emerald-50/30' : 'hover:bg-indigo-50/40'}`}>
                  <td className="px-6 py-4">
                    <div className={`font-bold ${isAdded ? 'text-emerald-800' : 'text-slate-800'}`}>{player.name}</div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">{player.gender}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-indigo-100 rounded text-[10px] font-black text-indigo-700 uppercase">
                      Level {player.levelWeight}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {isAdded ? (
                      <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase">
                        <CheckCircle size={14} /> In Session
                      </span>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase">Not Checked In</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => !isAdded && inviteToSession(player.id)}
                      disabled={isAdded}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded font-black text-[10px] uppercase transition-all shadow-sm ${
                        isAdded 
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200 shadow-none' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
                      }`}
                    >
                      {isAdded ? 'Already Added' : <><UserPlus size={14} /> Add to Court</>}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
