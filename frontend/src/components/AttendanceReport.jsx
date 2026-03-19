import { useState, useEffect } from 'react';
import { Users, Calendar } from 'lucide-react';
import { API_URL } from '../config';

export default function AttendanceReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/reports/attendance`);
        const data = await res.json();
        setReportData(data);
      } catch (error) {
        console.error("Failed to fetch attendance report:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

  if (loading) {
    return <div className="p-8 text-center">Loading attendance data...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-100 bg-slate-50">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <Users size={16} /> Attendance Report
        </h2>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {reportData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
            <Calendar size={48} />
            <p className="mt-2 font-black uppercase text-xs">No session data found</p>
          </div>
        ) : (
          reportData.map(session => (
            <div key={session.id} className="bg-white border border-slate-100 rounded-lg shadow-sm">
              <div className="p-4 bg-slate-50/50 border-b border-slate-100 rounded-t-lg">
                <h3 className="font-bold text-slate-800">{session.id}</h3>
                <p className="text-xs text-slate-500">
                  Session Date: {formatDate(session.createdAt)}
                </p>
              </div>
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] uppercase text-slate-400 font-black tracking-widest border-b border-slate-100">
                    <th className="px-4 py-3">Player Name</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3">Payment Method</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {session.players.map(player => (
                    <tr key={player.id}>
                      <td className="px-4 py-3 text-sm font-medium text-slate-700">{player.name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${player.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {player.paymentStatus || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-mono">{player.paymentMethod || 'N/A'}</td>
                    </tr>
                  ))}
                  {session.players.length === 0 && (<tr><td colSpan="3" className="text-center p-4 text-sm text-slate-400 italic">No players joined this session.</td></tr>)}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}