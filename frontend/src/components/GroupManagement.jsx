/*
import React, { useState } from 'react';
import { Layers, Users, ChevronRight, Plus, Target, Trash2 } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function GroupManagement() {
  const { groups, activeGroup, setActiveGroup } = useQueueStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      //Header Area
      <div className="p-8 bg-white border-b border-slate-200">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-3">
          <Layers className="text-indigo-600" size={28} />
          Queueing Groups
        </h2>
        <p className="text-slate-500 text-sm mt-1 font-medium">
          Manage your different badminton circles and their independent rosters.
        </p>
      </div>

      //Group Grid
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          //New Group Card
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="group h-48 border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-indigo-500 hover:bg-indigo-50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center transition-all">
              <Plus size={24} />
            </div>
            <span className="font-black uppercase text-[10px] tracking-widest text-slate-400 group-hover:text-indigo-600">Create New Group</span>
          </button>

          //Existing Group Card
          {groups.map((group) => {
            const isActive = activeGroup?.id === group.id;
            return (
              <div 
                key={group.id}
                className={`relative h-48 bg-white rounded-2xl p-6 shadow-sm border-2 transition-all flex flex-col justify-between ${
                  isActive ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-transparent hover:border-slate-300'
                }`}
              >
                {isActive && (
                  <div className="absolute -top-3 left-6 bg-indigo-600 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full tracking-widest">
                    Active Context
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-black text-slate-800 truncate">{group.name}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1 text-slate-400">
                      <Users size={14} />
                      <span className="text-xs font-bold">{group._count?.members || 0} Members</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400">
                      <Target size={14} />
                      <span className="text-xs font-bold">{group._count?.games || 0} Matches</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => setActiveGroup(group)}
                    disabled={isActive}
                    className={`flex-1 py-2 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${
                      isActive 
                        ? 'bg-slate-100 text-slate-400 cursor-default' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100'
                    }`}
                  >
                    {isActive ? 'Current Group' : 'Switch to Group'}
                  </button>
                  
                  <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
*/