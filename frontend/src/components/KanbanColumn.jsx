import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import PlayerCard from './PlayerCard';
import PendingGameCard from './PendingGameCard';

export default function KanbanColumn({ id, title, icon: Icon, items, colorTheme, onEditMatch }) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className={`flex flex-col h-full rounded-xl shadow-sm border ${colorTheme.bg} border-gray-200 overflow-hidden`}>
      {/* Column Header */}
      <div className={`p-3 font-black uppercase tracking-tighter flex items-center justify-between border-b border-black/5 ${colorTheme.headerBg} ${colorTheme.headerText}`}>
        <div className="flex items-center gap-2 text-xs">
          <Icon size={16} />
          {title}
        </div>
        <span className="bg-black/5 px-2 py-0.5 rounded-full text-[10px]">
          {items.length}
        </span>
      </div>

      {/* Column Body (Drop Zone) */}
      <div 
        ref={setNodeRef} 
        className="flex-1 p-3 overflow-y-auto flex flex-col gap-3 min-h-[200px]"
      >
        {items.map((item) => {
          // If this is the Pending column, render Game Cards
          if (id === 'col-pending') {
            return (
              <PendingGameCard 
                key={item.id} 
                game={item} 
                onEdit={onEditMatch} // Pass edit callback down
              />
            );
          }
          
          // Otherwise render Player Cards
          return <PlayerCard key={item.id} player={item} />;
        })}

        {items.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <Icon size={32} />
            <p className="text-[10px] font-black uppercase tracking-widest mt-2 italic">Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
