import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PlayerCard from './PlayerCard';

export default function KanbanColumn({ id, title, icon: Icon, items, colorTheme }) {
  // 1. Setup the Drop Zone
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <section 
      className={`flex flex-col h-full rounded-lg shadow-inner transition-colors ${colorTheme.bg} ${isOver ? 'ring-2 ring-indigo-400' : ''}`}
    >
      {/* 2. Column Header */}
      <div className={`p-3 rounded-t-lg font-bold flex items-center justify-between ${colorTheme.headerBg} ${colorTheme.headerText}`}>
        <div className="flex items-center gap-2">
          {Icon && <Icon size={20} />}
          {title}
        </div>
        {/* Count badge */}
        <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs">
          {items.length}
        </span>
      </div>

      {/* 3. The Droppable Area & Sortable Context */}
      <div 
        ref={setNodeRef} 
        className="flex-1 p-2 overflow-y-auto"
      >
        {/* SortableContext requires an array of unique identifiers (items.map(i => i.id)). 
          This tells dnd-kit exactly how to animate the list when a card is dragged over it.
        */}
        <SortableContext 
          items={items.map((item) => item.id)} 
          strategy={verticalListSortingStrategy}
        >
          {items.map((player) => (
            <PlayerCard key={player.id} player={player} />
          ))}
        </SortableContext>

        {/* Empty State Placeholder */}
        {items.length === 0 && (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-400/30 rounded-lg m-2">
            <p className="text-center text-gray-500 text-sm italic">Drop players here</p>
          </div>
        )}
      </div>
    </section>
  );
}
