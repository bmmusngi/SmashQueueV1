import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Swords } from 'lucide-react';

export default function PendingGameCard({ game }) {
  // Tell dnd-kit this is a draggable object, and pass the game data so the Court knows what landed on it
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: game.id,
    data: { type: 'PendingGame', game }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  // Helper to safely render team names 
  const formatTeam = (team) => {
    if (!team || team.length === 0) return 'TBD';
    return team.map(p => p.name).join(' & ');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg border-2 shadow-sm p-3 flex flex-col gap-2 transition-all ${
        isDragging ? 'border-indigo-500 shadow-xl cursor-grabbing scale-105' : 'border-gray-200 hover:border-indigo-300 cursor-grab'
      }`}
    >
      {/* Header & Drag Handle */}
      <div className="flex justify-between items-center text-xs text-gray-500 font-bold border-b border-gray-100 pb-2">
        <div className="flex items-center gap-1">
          <div {...listeners} {...attributes} className="p-1 hover:bg-gray-100 rounded text-gray-400 touch-none">
            <GripVertical size={16} />
          </div>
          <span className="text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
            {game.type || 'MATCH'}
          </span>
        </div>
        <Swords size={14} className="text-slate-400" />
      </div>

      {/* Team Matchup */}
      <div className="flex flex-col text-center mt-1 py-1">
        <span className="font-bold text-slate-800 text-sm">
          {formatTeam(game.teamA)}
        </span>
        <span className="text-[10px] font-black italic text-slate-300 my-1">VS</span>
        <span className="font-bold text-slate-800 text-sm">
          {formatTeam(game.teamB)}
        </span>
      </div>
    </div>
  );
}
