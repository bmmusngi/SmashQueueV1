import React, { useMemo } from 'react';
import { History, Trophy, Shovel, Clock } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function SessionHistory() {
  // Read completed games directly from the Zustand store.
  // This avoids redundant API calls and removes hardcoded URLs from components.
  const completedGames = useQueueStore(state => state.completedGames);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-100 bg-slate-50 flex justify-between items-center">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <History size={16} /> Completed Matches Today
        </h2>
        <div className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase">
          {completedGames.length} Matches Total
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {completedGames.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
            <Clock size={48} />
            <p className="mt-2 font-black uppercase text-xs">No matches completed yet</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Matchup</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Winner</th>
                <th className="px-4 py-3 text-right">Shuttles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {completedGames.map((game) => (
                <tr key={game.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 text-[10px] font-mono text-slate-400">
                    {formatDate(game.endedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <span>{game.teamA.map(p => p.name).join(' & ')}</span>
                      <span className="text-[10px] text-slate-300 italic font-black">VS</span>
                      <span>{game.teamB.map(p => p.name).join(' & ')}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-slate-100 text-slate-500 rounded">
                      {game.type}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {game.winner ? (
                      <div className="flex items-center gap-1 text-xs font-black text-emerald-600 uppercase">
                        <Trophy size={12} /> {game.winner === 'TEAM_A' ? 'Team A' : 'Team B'}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase">Unrecorded</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 text-slate-500 font-mono text-xs">
                      {game.shuttlesUsed || 0}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
