import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Swords, Edit2 } from 'lucide-react';

export default function PendingGameCard({ game, onEdit }) {
  // dnd-kit setup
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: game.id,
    data: { type: 'PendingGame', game }
  });

  // Visual drag styling
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.6 : 1,
  } : undefined;

  // Helper to safely render names
  const formatTeam = (team) => {
    if (!team || team.length === 0) return 'TBD';
    return team.map(p => p.name).join(' & ');
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-xl border-2 shadow-sm p-3 flex flex-col gap-3 transition-all ${
        isDragging 
          ? 'border-indigo-500 shadow-xl cursor-grabbing scale-105' 
          : 'border-slate-100 hover:border-indigo-200 cursor-grab'
      }`}
    >
      {/* Header Row */}
      <div className="flex justify-between items-center pb-2 border-b border-slate-50">
        <div className="flex items-center gap-1">
          {/* Drag Handle: Only this part triggers dragging */}
          <div 
            {...listeners} 
            {...attributes} 
            className="p-1 hover:bg-slate-50 rounded text-slate-300 hover:text-indigo-400 touch-none transition-colors"
          >
            <GripVertical size={16} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
            {game.type || 'MATCH'}
          </span>
        </div>

        {/* Action Button: Edit */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevents dragging when clicking the button
            if (onEdit) onEdit(game);
          }}
          className="p-1.5 hover:bg-indigo-50 text-slate-300 hover:text-indigo-600 rounded-lg transition-all"
          title="Edit Matchup"
        >
          <Edit2 size={14} />
        </button>
      </div>

      {/* Matchup Body */}
      <div className="flex flex-col items-center gap-1 py-1">
        <div className="w-full text-center">
          <p className="text-xs font-black text-slate-800 truncate px-2">
            {formatTeam(game.teamA)}
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full">
          <div className="h-[1px] flex-1 bg-slate-100"></div>
          <span className="text-[9px] font-black italic text-slate-300 uppercase">vs</span>
          <div className="h-[1px] flex-1 bg-slate-100"></div>
        </div>

        <div className="w-full text-center">
          <p className="text-xs font-black text-slate-800 truncate px-2">
            {formatTeam(game.teamB)}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex justify-between items-center pt-1">
        <div className="flex items-center gap-1 text-slate-300">
          <Swords size={12} />
          <span className="text-[9px] font-bold uppercase tracking-tight">Drafted Match</span>
        </div>
        {game.shuttlesUsed > 0 && (
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
            {game.shuttlesUsed} Shuttles
          </span>
        )}
      </div>
    </div>
  );
}
