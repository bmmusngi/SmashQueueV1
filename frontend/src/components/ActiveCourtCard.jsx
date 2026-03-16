import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Timer, CheckCircle } from 'lucide-react';
// IMPORTANT: Ensure this file exists exactly as named!
import CompleteGameModal from './CompleteGameModal';

export default function ActiveCourtCard({ court }) {
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  const { setNodeRef, isOver } = useDroppable({
    id: `court-${court.id}`,
    data: { type: 'Court', court }
  });

  useEffect(() => {
    let interval;
    if (court?.activeGame?.startedAt) {
      interval = setInterval(() => {
        const start = new Date(court.activeGame.startedAt).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => clearInterval(interval);
  }, [court?.activeGame]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      <div
        ref={setNodeRef}
        className={`relative flex flex-col bg-white rounded-lg shadow border-2 transition-colors ${
          isOver ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-100'
        } p-4 h-48`}
      >
        <div className="flex justify-between items-center mb-3 border-b pb-2">
          <h3 className="font-bold text-lg text-emerald-900">{court.name || `Court ${court.number}`}</h3>
          
          {court.activeGame ? (
            <div className={`flex items-center gap-1 font-mono font-bold px-2 py-1 rounded ${
              elapsedTime > 1200 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-slate-100 text-slate-700'
            }`}>
              <Timer size={16} />
              {formatTime(elapsedTime)}
            </div>
          ) : (
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Empty</span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-center">
          {court.activeGame ? (
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-800 mb-1">
                {court.activeGame.teamA?.map(p => p.name).filter(Boolean).join(' & ') || 'Unknown Players'}
              </div>
              <div className="text-xs font-black text-gray-300 italic mb-1">VS</div>
              <div className="text-sm font-semibold text-gray-800">
                {court.activeGame.teamB?.map(p => p.name).filter(Boolean).join(' & ') || 'Unknown Players'}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400 text-sm italic">
              Drag a pending game here to start
            </div>
          )}
        </div>

        {court.activeGame && (
          <button 
            onClick={() => setIsCompleteModalOpen(true)}
            className="mt-3 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded flex justify-center items-center gap-2 transition-colors"
          >
            <CheckCircle size={18} />
            Complete Game
          </button>
        )}
      </div>

      <CompleteGameModal 
        isOpen={isCompleteModalOpen} 
        onClose={() => setIsCompleteModalOpen(false)} 
        court={court} 
      />
    </>
  );
}
