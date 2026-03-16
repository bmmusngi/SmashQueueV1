import React, { useState } from 'react';
import { X, Trophy, Target } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function CompleteGameModal({ isOpen, onClose, court }) {
  const completeGame = useQueueStore((state) => state.completeGame);

  const [winner, setWinner] = useState('');
  const [shuttlesUsed, setShuttlesUsed] = useState(1);

  if (!isOpen || !court || !court.activeGame) return null;

  const game = court.activeGame;
  
  // Format team names for the UI
  const teamAName = game.teamA.map(p => p.name).join(' & ');
  const teamBName = game.teamB.map(p => p.name).join(' & ');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Call the store action to update DB and clear the court
    completeGame(court.id, game.id, {
      winner: winner || null, // Allow no winner (e.g., practice game)
      shuttlesUsed: Number(shuttlesUsed)
    });

    // Reset and close
    setWinner('');
    setShuttlesUsed(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 touch-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-emerald-500">
        
        {/* Header */}
        <div className="bg-emerald-50 p-4 flex justify-between items-center text-emerald-900 border-b border-emerald-100">
          <div className="flex items-center gap-2 font-bold text-lg">
            <Trophy size={20} className="text-emerald-600" />
            Complete Match: {court.name}
          </div>
          <button onClick={onClose} className="text-emerald-600 hover:text-emerald-800 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          
          {/* Winner Selection */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3 text-center">Who won?</label>
            <div className="flex flex-col gap-2">
              <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${winner === 'Team A' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" value="Team A" checked={winner === 'Team A'} onChange={(e) => setWinner(e.target.value)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <span className="font-semibold text-gray-800">{teamAName}</span>
                </div>
              </label>

              <label className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-colors ${winner === 'Team B' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <input type="radio" value="Team B" checked={winner === 'Team B'} onChange={(e) => setWinner(e.target.value)} className="w-4 h-4 text-emerald-600 focus:ring-emerald-500" />
                  <span className="font-semibold text-gray-800">{teamBName}</span>
                </div>
              </label>
              
              <label className="flex items-center gap-2 justify-center mt-2 cursor-pointer">
                <input type="radio" value="" checked={winner === ''} onChange={(e) => setWinner(e.target.value)} className="text-gray-400" />
                <span className="text-xs text-gray-500">No Winner / Practice Match</span>
              </label>
            </div>
          </div>

          {/* Shuttle Tracking */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <div className="flex items-center gap-2 mb-2 text-slate-700 font-bold text-sm">
              <Target size={16} />
              Shuttlecock Usage
            </div>
            <p className="text-xs text-slate-500 mb-3">How many new shuttlecocks were consumed in this game?</p>
            <input 
              type="number" 
              min="0"
              max="10"
              required
              value={shuttlesUsed}
              onChange={(e) => setShuttlesUsed(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 text-lg font-bold text-center focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold shadow-md flex items-center gap-2 transition-colors">
              <Trophy size={18} /> Finish Game
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
