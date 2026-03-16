import React, { useState } from 'react';
import { X, Swords } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function DraftMatchModal({ isOpen, onClose }) {
  const players = useQueueStore((state) => state.players);
  const draftGame = useQueueStore((state) => state.draftGame);

  const [matchType, setMatchType] = useState('DOUBLES');
  
  // Storing the selected player IDs
  const [teamA1, setTeamA1] = useState('');
  const [teamA2, setTeamA2] = useState('');
  const [teamB1, setTeamB1] = useState('');
  const [teamB2, setTeamB2] = useState('');

  if (!isOpen) return null;

  // Helper to get full player object from ID
  const getPlayer = (id) => players.find(p => p.id === id) || null;

  // Calculate Weights
  const weightA = (getPlayer(teamA1)?.levelWeight || 0) + (matchType === 'DOUBLES' ? (getPlayer(teamA2)?.levelWeight || 0) : 0);
  const weightB = (getPlayer(teamB1)?.levelWeight || 0) + (matchType === 'DOUBLES' ? (getPlayer(teamB2)?.levelWeight || 0) : 0);
  const isMismatch = Math.abs(weightA - weightB) > 1;

  // Get all currently selected IDs so we don't pick the same person twice
  const selectedIds = [teamA1, teamA2, teamB1, teamB2].filter(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const teamA = [getPlayer(teamA1), matchType === 'DOUBLES' ? getPlayer(teamA2) : null].filter(Boolean);
    const teamB = [getPlayer(teamB1), matchType === 'DOUBLES' ? getPlayer(teamB2) : null].filter(Boolean);

    if (teamA.length === 0 || teamB.length === 0) return alert("Both teams need at least one player!");

    draftGame({
      id: `g-${Date.now()}`,
      type: matchType,
      teamA,
      teamB
    });

    // Reset and close
    setTeamA1(''); setTeamA2(''); setTeamB1(''); setTeamB2('');
    onClose();
  };

  // Reusable dropdown for player slots
  const PlayerSelect = ({ value, onChange, label }) => (
    <div className="flex-1">
      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        <option value="">-- Select Player --</option>
        {players.map(p => (
          <option 
            key={p.id} 
            value={p.id} 
            disabled={selectedIds.includes(p.id) && value !== p.id}
          >
            {p.name} (Lvl {p.levelWeight})
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 touch-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Swords size={20} />
            Draft Match
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Match Type Toggle */}
          <div className="flex gap-4 mb-6 justify-center">
            <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-200 transition">
              <input type="radio" value="SINGLES" checked={matchType === 'SINGLES'} onChange={(e) => setMatchType(e.target.value)} className="text-indigo-600" />
              <span className="font-bold text-slate-700">Singles</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-200 transition">
              <input type="radio" value="DOUBLES" checked={matchType === 'DOUBLES'} onChange={(e) => setMatchType(e.target.value)} className="text-indigo-600" />
              <span className="font-bold text-slate-700">Doubles</span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-6 items-stretch">
            {/* Team A */}
            <div className="flex-1 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-3 text-center border-b border-indigo-200 pb-2">Team A</h4>
              <div className="space-y-3">
                <PlayerSelect value={teamA1} onChange={setTeamA1} label="Player 1" />
                {matchType === 'DOUBLES' && <PlayerSelect value={teamA2} onChange={setTeamA2} label="Player 2" />}
              </div>
              <div className="mt-4 text-center text-sm font-bold text-indigo-700 bg-indigo-100 py-1 rounded">
                Total Weight: {weightA}
              </div>
            </div>

            {/* VS Badge */}
            <div className="flex items-center justify-center font-black text-2xl text-slate-300 italic">VS</div>

            {/* Team B */}
            <div className="flex-1 bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h4 className="font-bold text-emerald-900 mb-3 text-center border-b border-emerald-200 pb-2">Team B</h4>
              <div className="space-y-3">
                <PlayerSelect value={teamB1} onChange={setTeamB1} label="Player 1" />
                {matchType === 'DOUBLES' && <PlayerSelect value={teamB2} onChange={setTeamB2} label="Player 2" />}
              </div>
              <div className="mt-4 text-center text-sm font-bold text-emerald-700 bg-emerald-100 py-1 rounded">
                Total Weight: {weightB}
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          {isMismatch && (
            <div className="mt-4 bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded text-center text-sm font-bold animate-pulse">
              ⚠️ Level Mismatch Detected: Review palag weight before drafting!
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium transition-colors">Cancel</button>
            <button type="submit" className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded font-bold shadow-md flex items-center gap-2 transition-colors">
              <Swords size={18} /> Draft Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
