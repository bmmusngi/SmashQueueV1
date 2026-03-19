import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, AlertCircle, CheckCircle2, Timer } from 'lucide-react';

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
  // 1. Setup dnd-kit hooks for dragging
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: player.id, data: { type: 'Player', player } });

  // 2. Apply the drag transforms (so the card actually moves with your finger)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Slightly fade the original card while dragging
    opacity: isDragging ? 0.4 : 1, 
    // Pop the card up visually when grabbed
    zIndex: isDragging ? 50 : 'auto',
  };

  const levelInfo = getLevelStyles(player.levelWeight);
  const isPaid = player.paymentStatus === 'PAID';
  const isResting = player.status === 'RESTING';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center p-3 mb-2 rounded-lg shadow-sm border border-gray-200 touch-none select-none ${levelInfo.bg}`}
    >
      {/* 3. The Drag Handle (Where the QM grabs the card) */}
      <div 
        {...attributes} 
        {...listeners} 
        className="mr-2 cursor-grab active:cursor-grabbing text-gray-500 hover:text-gray-700"
      >
        <GripVertical size={20} />
      </div>

      {/* 4. Player Information */}
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-800 text-lg leading-tight">
            {player.name} <span className="text-sm font-normal text-gray-500">({player.gender})</span>
          </h3>
          
          {/* Status/Payment Icons */}
          <div className="flex items-center gap-1">
            {isResting ? (
              <Timer size={16} className="text-orange-600 animate-pulse" title="Resting" />
            ) : null}
            
            {isPaid ? (
              <CheckCircle2 size={16} className="text-green-600" title={`Paid via ${player.paymentMode}`} />
            ) : (
              <AlertCircle size={16} className="text-red-500" title="Unpaid" />
            )}
          </div>
        </div>

        {/* Level Tag & Minor Details */}
        <div className="flex justify-between items-center mt-1">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/50 ${levelInfo.text}`}>
            {levelInfo.name} (Lvl {player.levelWeight})
          </span>
          
          {/* E.g., display specific payment mode if paid, or just UNPAID */}
          <span className={`text-[10px] font-bold tracking-wider ${isPaid ? 'text-green-700' : 'text-red-600'}`}>
            {isPaid ? player.paymentMode : 'UNPAID'}
          </span>
        </div>
      </div>
    </div>
  );
}
