import React, { useState, useEffect } from 'react';
import { Search, Filter, UserPlus, Trophy, Info } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function PlayerRoster() {
  const { globalPlayers, fetchGlobalPlayers, inviteToSession, players: sessionPlayers } = useQueueStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchGlobalPlayers();
  }, [fetchGlobalPlayers]);

  // Filter out players already in the current session
  const filteredPlayers = globalPlayers.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !sessionPlayers.some(sp => sp.id === p.id)
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Roster Toolbar */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
        <div className="relative w-72">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search global roster..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="text-sm text-gray-500 font-medium">
          Showing {filteredPlayers.length} members
        </div>
      </div>

      {/* Roster Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <tr className="text-xs uppercase text-gray-400 font-black tracking-widest">
              <th className="px-6 py-4">Player</th>
              <th className="px-6 py-4">Level</th>
              <th className="px-6 py-4">Performance (W/L/T)</th>
              <th className="px-6 py-4">Lifetime Games</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-bold text-gray-800">{player.name}</div>
                  <div className="text-xs text-gray-400 uppercase font-bold">{player.gender}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">
                    Weight: {player.levelWeight}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-bold">{player.wins || 0}W</span>
                    <span className="text-red-500 font-bold">{player.losses || 0}L</span>
                    <span className="text-gray-400 font-bold">{player.ties || 0}T</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 font-mono">
                  { (player.wins || 0) + (player.losses || 0) + (player.ties || 0) }
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => inviteToSession(player.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-600 rounded-md text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <UserPlus size={14} /> Add to Session
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
