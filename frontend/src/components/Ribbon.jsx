import React from 'react';
import { LayoutGrid, Users, History, BarChart3, Plus, Swords, LogOut } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function Ribbon({ onAddPlayer, onDraftMatch }) {
  const currentView = useQueueStore((state) => state.currentView);
  const setView = useQueueStore((state) => state.setView);
  const resetSession = useQueueStore((state) => state.resetSession);

  const modules = [
    { id: 'LIVE_QUEUE', label: 'Live Queue', icon: LayoutGrid },
    { id: 'PLAYER_ROSTER', label: 'Players', icon: Users },
    { id: 'HISTORY', label: 'History', icon: History },
    { id: 'REPORTS', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm z-20">
      {/* Tier 1: Main Modules */}
      <div className="flex items-center px-4 bg-slate-50 border-b border-gray-100">
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = currentView === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setView(mod.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 ${
                isActive 
                  ? 'border-indigo-600 text-indigo-600 bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              {mod.label}
            </button>
          );
        })}
      </div>

      {/* Tier 2: Contextual Actions */}
      <div className="flex items-center justify-between px-4 py-2 bg-white min-h-[50px]">
         <div className="flex gap-2">
          {currentView === 'LIVE_QUEUE' && (
            <>
              {/* ... existing buttons ... */}
              <button 
                onClick={() => onBulkUpload('SESSION')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-md text-sm font-bold hover:bg-black transition-colors shadow-sm"
              >
                <Upload size={16} /> Bulk Add
              </button>
            </>
          )}
          
          {currentView === 'PLAYER_ROSTER' && (
            <button 
              onClick={() => onBulkUpload('GLOBAL')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-md text-sm font-bold hover:bg-black transition-colors shadow-sm"
            >
              <Upload size={16} /> Mass Registration
            </button>
          )}
        </div>

        {/* Universal Action: End Session */}
        <button 
          onClick={resetSession}
          className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md text-sm font-bold transition-colors"
        >
          <LogOut size={16} /> End Session
        </button>
      </div>
    </div>
  );
}
