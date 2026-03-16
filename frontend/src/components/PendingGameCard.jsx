import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Edit2 } from 'lucide-react';

export default function PendingGameCard({ game }) {
  // 1. Setup dnd-kit hooks so the whole game can be dragged to a court
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id, data: { type: 'PendingGame', game } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  // 2. Helper to calculate combined team weights
  const calculateWeight = (team) => {
    return team.reduce((total, player) => total + (player.levelWeight || 0), 0);
  };

  const weightA = calculateWeight(game.teamA);
  const weightB = calculateWeight(game.teamB);
  
  // Calculate difference to warn the Queue Master of a mismatch (e.g., > 1 point diff)
  const isMismatch = Math.abs(weightA - weightB) > 1;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative flex flex-col p-3 mb-3 bg-white rounded-lg shadow border-l-4 border-indigo-500 touch-none select-none"
    >
      {/* Card Header & Drag Handle */}
      <div className="flex justify-between items-center mb-2 border-b border-gray-100 pb-2">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-indigo-600"
          >
            <GripVertical size={18} />
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
            {game.type}
          </span>
        </div>
        
        {/* Quick Actions */}
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-blue-600" title="Edit Game">
            <Edit2 size={16} />
          </button>
          <button className="text-gray-400 hover:text-red-600" title="Cancel Game">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Matchup Display */}
      <div className="flex justify-between items-center text-sm">
        {/* Team A */}
        <div className="flex-1 text-center">
          <div className="font-semibold text-gray-800">
            {game.teamA.map(p => p.name).join(' & ') || <span className="text-gray-400 italic">Empty Slot</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">Weight: {weightA}</div>
        </div>

        {/* VS Badge */}
        <div className="px-3 font-black text-gray-300 italic">VS</div>

        {/* Team B */}
        <div className="flex-1 text-center">
          <div className="font-semibold text-gray-800">
            {game.teamB.map(p => p.name).join(' & ') || <span className="text-gray-400 italic">Empty Slot</span>}
          </div>
          <div className="text-xs text-gray-500 mt-1">Weight: {weightB}</div>
        </div>
      </div>

      {/* Mismatch Warning */}
      {isMismatch && (
        <div className="mt-2 text-[10px] text-center text-red-600 bg-red-50 py-0.5 rounded font-medium">
          ⚠️ Level Mismatch Detected (Palag check required)
        </div>
      )}
    </div>
  );
}
