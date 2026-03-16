import React, { useState, useEffect } from 'react';
import { X, Swords, AlertTriangle, ChevronRight } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function DraftMatchModal({ isOpen, onClose, initialData = null }) {
  const { players, draftGame, updateGame } = useQueueStore();
  
  const [type, setType] = useState('DOUBLES');
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);

  // Reset or Load data when modal opens/changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || 'DOUBLES');
        setTeamA(initialData.teamA || []);
        setTeamB(initialData.teamB || []);
      } else {
        setType('DOUBLES');
        setTeamA([]);
        setTeamB([]);
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // Filter out players already selected in either team
  const availablePlayers = players.filter(p => 
    !teamA.find(a => a.id === p.id) && !teamB.find(b => b.id === p.id)
  );

  const calculateWeight = (team) => team.reduce((sum, p) => sum + (p.levelWeight || 0), 0);
  const weightA = calculateWeight(teamA);
  const weightB = calculateWeight(teamB);
  const weightDiff = Math.abs(weightA - weightB);
  const isLopsided = weightDiff > 2 && teamA.length > 0 && teamB.length > 0;

  const handleSave = async () => {
    const payload = { type, teamA, teamB };
    
    if (initialData?.id) {
      await updateGame(initialData.id, payload);
    } else {
      await draftGame(payload);
    }
    onClose();
  };

  const togglePlayer = (player, team, setTeam) => {
    if (team.find(p => p.id === player.id)) {
      setTeam(team.filter(p => p.id !== player.id));
    } else {
      const max = type === 'SINGLES' ? 1 : 2;
      if (team.length < max) setTeam([...team, player]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <Swords size={20} className="text-indigo-400" />
            <h3 className="font-black uppercase tracking-widest text-sm">
              {initialData ? 'Edit Matchup' : 'Draft New Match'}
            </h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Player Selection */}
          <div className="w-full md:w-1/3 border-r border-slate-100 flex flex-col bg-slate-50">
            <div className="p-4 border-b border-slate-200 bg-white">
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Game Type</label>
              <div className="flex gap-2">
                {['SINGLES', 'DOUBLES'].map(t => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setTeamA([]); setTeamB([]); }}
                    className={`flex-1 py-2 rounded text-[10px] font-black uppercase transition-all ${
                      type === t ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-2 italic">Available for Drafting</p>
              {availablePlayers.map(p => (
                <div key={p.id} className="flex gap-1">
                  <button 
                    onClick={() => togglePlayer(p, teamA, setTeamA)}
                    className="flex-1 bg-white border border-slate-200 p-2 rounded text-left hover:border-indigo-500 transition-all flex justify-between items-center group"
                  >
                    <span className="text-sm font-bold text-slate-700">{p.name}</span>
                    <span className="text-[10px] font-black text-slate-300 group-hover:text-indigo-500 flex items-center gap-1">
                      A <ChevronRight size={12} />
                    </span>
                  </button>
                  <button 
                    onClick={() => togglePlayer(p, teamB, setTeamB)}
                    className="bg-white border border-slate-200 p-2 rounded hover:border-rose-500 transition-all text-[10px] font-black text-slate-300 hover:text-rose-500"
                  >
                    B
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right: The Matchup Board */}
          <div className="flex-1 p-6 flex flex-col justify-center items-center bg-white relative">
            <div className="grid grid-cols-1 md:grid-cols-3 w-full items-center gap-4">
              
              {/* Team A */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Team A</p>
                  <p className="text-2xl font-black text-slate-800">{weightA}</p>
                </div>
                <div className="min-h-[120px] p-4 rounded-xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 space-y-2">
                  {teamA.map(p => (
                    <div key={p.id} className="bg-white p-2 rounded shadow-sm flex justify-between items-center">
                      <span className="text-sm font-bold">{p.name}</span>
                      <button onClick={() => setTeamA(teamA.filter(x => x.id !== p.id))} className="text-slate-300 hover:text-rose-500"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-slate-900 text-white rounded-full flex items-center justify-center font-black italic shadow-lg">VS</div>
                {isLopsided && (
                  <div className="mt-4 text-center text-amber-600 animate-pulse">
                    <AlertTriangle size={24} className="mx-auto" />
                    <p className="text-[8px] font-black uppercase mt-1">Lopsided Match</p>
                  </div>
                )}
              </div>

              {/* Team B */}
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase text-rose-600 tracking-widest">Team B</p>
                  <p className="text-2xl font-black text-slate-800">{weightB}</p>
                </div>
                <div className="min-h-[120px] p-4 rounded-xl border-2 border-dashed border-rose-100 bg-rose-50/30 space-y-2">
                  {teamB.map(p => (
                    <div key={p.id} className="bg-white p-2 rounded shadow-sm flex justify-between items-center">
                      <span className="text-sm font-bold">{p.name}</span>
                      <button onClick={() => setTeamB(teamB.filter(x => x.id !== p.id))} className="text-slate-300 hover:text-rose-500"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center px-8">
          <div className="text-xs font-bold text-slate-400 italic uppercase">
            {isLopsided ? `Balance Issue: ${weightDiff} pts diff` : 'Matchup looks balanced'}
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-6 py-2 text-slate-400 font-black uppercase text-xs hover:text-slate-600 transition-colors">Cancel</button>
            <button 
              onClick={handleSave}
              disabled={teamA.length === 0 || teamB.length === 0}
              className={`px-8 py-3 rounded-xl font-black text-xs uppercase transition-all shadow-xl active:scale-95 disabled:opacity-50 disabled:grayscale ${
                isLopsided ? 'bg-amber-500 hover:bg-amber-600' : 'bg-indigo-600 hover:bg-indigo-700'
              } text-white`}
            >
              {initialData ? 'Update Matchup' : isLopsided ? 'Force Draft Match' : 'Confirm Matchup'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
