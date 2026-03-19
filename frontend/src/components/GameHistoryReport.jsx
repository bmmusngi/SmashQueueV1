import React, { useState, useEffect } from 'react';
import { History, Trophy, Shovel } from 'lucide-react';
import { API_URL } from '../config';

export default function GameHistoryReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/reports/game-history`);
        const data = await res.json();
        setReportData(data);
      } catch (error) {
        console.error("Failed to fetch game history report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  const getWinnerName = (game) => {
    if (!game.winner) return 'Draw/Unrecorded';
    if (game.winner === 'TEAM_A') return 'Team A';
    if (game.winner === 'TEAM_B') return 'Team B';
    return 'N/A';
  };

  if (loading) {
    return <div className="p-8 text-center">Loading game history...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-100 bg-slate-50">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <History size={16} /> Game History Report
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {reportData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 italic"><History size={48} /><p className="mt-2 font-black uppercase text-xs">No game history found</p></div>
        ) : (
          reportData.map(session => (
            <div key={session.id} className="bg-white border border-slate-100 rounded-lg shadow-sm">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 rounded-t-lg">
                <h3 className="font-bold text-slate-800">{session.id}</h3>
                <p className="text-xs text-slate-500">Session Date: {formatDate(session.createdAt)}</p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                    <th className="px-4 py-3">Team A</th>
                    <th className="px-4 py-3">Team B</th>
                    <th className="px-4 py-3">Winner</th>
                    <th className="px-4 py-3 text-right">Shuttles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {session.games.map(game => (
                    <tr key={game.id}>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">{game.teamA.map(p => p.name).join(' & ')}</td>
                      <td className="px-4 py-3 text-xs font-bold text-slate-700">{game.teamB.map(p => p.name).join(' & ')}</td>
                      <td className="px-4 py-3"><div className="flex items-center gap-1 text-xs font-black text-emerald-600 uppercase"><Trophy size={12} /> {getWinnerName(game)}</div></td>
                      <td className="px-4 py-3 text-right"><div className="flex items-center justify-end gap-1 text-slate-500 font-mono text-xs">{game.shuttlesUsed || 0} <Shovel size={12} /></div></td>
                    </tr>
                  ))}
                  {session.games.length === 0 && (<tr><td colSpan="4" className="text-center p-4 text-sm text-slate-400 italic">No completed games in this session.</td></tr>)}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}