import React from 'react';
import { 
  LayoutGrid, 
  Users, 
  History, 
  BarChart3, 
  Plus, 
  Swords, 
  LogOut, 
  Upload,
  Layers // Added icon for Groups
} from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function Ribbon({ onAddPlayer, onDraftMatch, onBulkUpload }) {
  const currentView = useQueueStore((state) => state.currentView);
  const setView = useQueueStore((state) => state.setView);
  const resetSession = useQueueStore((state) => state.resetSession);

  // Added Queueing Group to the module list
  const modules = [
    { id: 'LIVE_QUEUE', label: 'Live Queue', icon: LayoutGrid },
    { id: 'PLAYER_ROSTER', label: 'Players', icon: Users },
    { id: 'HISTORY', label: 'History', icon: History },
    { id: 'QUEUEING_GROUP', label: 'Groups', icon: Layers }, // New Module
    { id: 'REPORTS', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm z-20 shrink-0">
      {/* Tier 1: Main Modules */}
      <div className="flex items-center px-4 bg-slate-50 border-b border-gray-100 overflow-x-auto no-scrollbar">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = currentView === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setView(mod.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-black uppercase tracking-tighter transition-all border-b-2 whitespace-nowrap ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 bg-white' 
                  : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-gray-100'
              }`}
            >
              <Icon size={16} />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Tier 2: Contextual Actions */}
      <div className="flex items-center justify-between px-4 py-2 bg-white min-h-[52px]">
        <div className="flex gap-2">
          {currentView === 'LIVE_QUEUE' && (
            <>
              <button 
                onClick={onAddPlayer}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
              >
                <Plus size={14} /> Add Player
              </button>
              <button 
                onClick={onDraftMatch}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-[10px] font-black uppercase hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
              >
                <Swords size={14} /> Draft Match
              </button>
              <button 
                onClick={() => onBulkUpload('SESSION')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded text-[10px] font-black uppercase hover:bg-black transition-all shadow-sm active:scale-95"
              >
                <Upload size={14} /> Bulk Add
              </button>
            </>
          )}
          
          {currentView === 'PLAYER_ROSTER' && (
            <button 
              onClick={() => onBulkUpload('GLOBAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded text-[10px] font-black uppercase hover:bg-indigo-700 transition-all shadow-sm active:scale-95"
            >
              <Plus size={14} /> Register Member
            </button>
          )}

          {/* Contextual actions for Group Management will appear here once defined */}
          {currentView === 'QUEUEING_GROUP' && (
            <div className="flex items-center px-3 py-1.5 text-slate-400 text-[10px] font-black uppercase italic">
              Group Management Logic Pending
            </div>
          )}
        </div>

        <button 
          onClick={resetSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded text-[10px] font-black uppercase transition-all"
        >
          <LogOut size={14} /> End Day
        </button>
      </div>
    </div>
  );
}
