import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertCircle, CheckCircle2, Timer, Power, Trash2 } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

// Helper function to map the numerical level to the Tailwind colors we defined
const getLevelStyles = (levelWeight) => {
  switch (levelWeight) {
    case 1: return { name: 'Beginner', bg: 'bg-level-beginner', text: 'text-emerald-800' };
    case 2: return { name: 'Intermediate', bg: 'bg-level-intermediate', text: 'text-yellow-800' };
    case 3: return { name: 'Advanced', bg: 'bg-level-advanced', text: 'text-orange-800' };
    case 4: return { name: 'Expert', bg: 'bg-level-expert', text: 'text-red-800' };
    case 5: return { name: 'VIP', bg: 'bg-level-vip', text: 'text-purple-800' };
    default: return { name: 'Unranked', bg: 'bg-gray-200', text: 'text-gray-800' };
  }
};

export default function PlayerCard({ player }) {
  // Pull the actions from our Zustand store
  const { toggleSessionPlayerStatus, removeSessionPlayer } = useQueueStore();

  // 1. Setup dnd-kit hooks for dragging
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id, data: { type: 'Player', player } });

  // 2. Apply the drag transforms
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1, 
    zIndex: isDragging ? 50 : 'auto',
  };

  const levelInfo = getLevelStyles(player.levelWeight);
  const isPaid = player.paymentStatus === 'PAID';
  const isInactive = player.status === 'INACTIVE'; // Matches our backend soft-delete status

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center p-3 mb-2 rounded-lg shadow-sm border border-gray-200 touch-none select-none transition-all ${
        isInactive ? 'bg-slate-50 opacity-60 grayscale-[0.5]' : levelInfo.bg
      }`}
    >
      {/* 3. The Drag Handle */}
      {/* Notice listeners are ONLY on the grip, so clicking buttons won't trigger a drag */}
      <div 
        {...attributes} 
        {...listeners} 
        className={`mr-2 cursor-grab active:cursor-grabbing hover:text-gray-700 ${isInactive ? 'text-slate-300' : 'text-gray-500'}`}
      >
        <GripVertical size={20} />
      </div>

      {/* 4. Player Information */}
      <div className="flex-1 min-w-0 pr-2">
        <div className="flex justify-between items-start">
          <h3 className={`font-bold text-lg leading-tight truncate ${isInactive ? 'text-slate-500 line-through' : 'text-gray-800'}`}>
            {player.name} <span className="text-sm font-normal opacity-70">({player.gender})</span>
          </h3>
          
          {/* Status/Payment Icons */}
          <div className="flex items-center gap-1 shrink-0">
            {isInactive ? (
              <Timer size={16} className="text-orange-500 animate-pulse" title="On Break" />
            ) : null}
            
            {isPaid ? (
              <CheckCircle2 size={16} className={isInactive ? "text-slate-400" : "text-green-600"} title={`Paid via ${player.paymentMode}`} />
            ) : (
              <AlertCircle size={16} className={isInactive ? "text-slate-400" : "text-red-500"} title="Unpaid" />
            )}
          </div>
        </div>

        {/* Level Tag & Minor Details */}
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${isInactive ? 'bg-slate-200 text-slate-500' : `bg-white/50 ${levelInfo.text}`}`}>
            {levelInfo.name} (Lvl {player.levelWeight})
          </span>
          
          <span className={`text-[10px] font-bold tracking-wider ${isInactive ? 'text-slate-400' : isPaid ? 'text-green-700' : 'text-red-600'}`}>
            {isPaid ? player.paymentMode : 'UNPAID'}
          </span>
        </div>
      </div>

      {/* 5. Player Queue Actions */}
      <div className="flex flex-col gap-1.5 pl-2 border-l border-black/10 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevents bubbling issues with mobile touch
            toggleSessionPlayerStatus(player.id, player.status);
          }}
          className={`p-1.5 rounded-md transition-colors flex justify-center items-center ${
            isInactive 
            ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200' 
            : 'bg-slate-200/50 text-slate-500 hover:bg-slate-300'
          }`}
          title={isInactive ? "Return to active queue" : "Take a break"}
        >
          <Power size={14} />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeSessionPlayer(player.id);
          }}
          className="p-1.5 rounded-md bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-colors flex justify-center items-center"
          title="Remove completely"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
