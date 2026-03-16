import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import PlayerCard from './PlayerCard';
import PendingGameCard from './PendingGameCard'; // Make sure this is imported!

export default function KanbanColumn({ id, title, icon: Icon, items, colorTheme }) {
  // Setup the drop zone for dnd-kit
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className={`flex flex-col h-full rounded-lg shadow-sm border ${colorTheme.bg} border-gray-200`}>
      {/* Column Header */}
      <div className={`p-3 rounded-t-lg font-bold flex items-center justify-between border-b border-black/5 ${colorTheme.headerBg} ${colorTheme.headerText}`}>
        <div className="flex items-center gap-2">
          <Icon size={18} />
          {title}
        </div>
        <span className="bg-black/10 px-2 py-0.5 rounded-full text-xs">
          {items.length}
        </span>
      </div>

      {/* Column Body (Drop Zone) */}
      <div 
        ref={setNodeRef} 
        className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 min-h-[150px]"
      >
        {items.map((item) => {
          // THE FIX: Conditionally render the correct card UI
          if (id === 'col-pending') {
            return <PendingGameCard key={item.id} game={item} />;
          }
          
          return <PlayerCard key={item.id} player={item} />;
        })}

        {items.length === 0 && (
          <div className="h-full flex items-center justify-center text-sm font-medium opacity-40 text-center italic">
            Drag items here
          </div>
        )}
      </div>
    </div>
  );
}
