import React, { useState, useEffect } from 'react';
import { DndContext, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Users, LayoutGrid, Activity } from 'lucide-react';

import useQueueStore from './store/useQueueStore';
import Ribbon from './components/Ribbon';
import KanbanColumn from './components/KanbanColumn';
import ActiveCourtCard from './components/ActiveCourtCard';
import AddPlayerModal from './components/AddPlayerModal';
import DraftMatchModal from './components/DraftMatchModal';
import PlayerRoster from './components/PlayerRoster';
import BulkUploadModal from './components/BulkUploadModal';

function App() {
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isDraftMatchOpen, setIsDraftMatchOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [bulkTarget, setBulkTarget] = useState('SESSION');

  const { players, pendingGames, courts, sessionId, currentView, initSession, assignGameToCourt } = useQueueStore();

  useEffect(() => { initSession(); }, [initSession]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.data.current?.type === 'PendingGame' && over.data.current?.type === 'Court') {
      assignGameToCourt(active.id, over.data.current.court.id);
    }
  };

  const triggerBulkUpload = (target) => {
    setBulkTarget(target);
    setIsBulkOpen(true);
  };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 font-sans overflow-hidden">
      <header className="bg-indigo-900 text-white px-4 py-3 flex justify-between items-center shadow-md shrink-0 z-30">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">Badminton Q-Master</h1>
        <div className="text-right">
          <p className="text-[10px] text-indigo-300 uppercase font-black tracking-widest leading-none">Session ID</p>
          <p className="text-sm font-mono font-bold text-emerald-400">{sessionId || '...'}</p>
        </div>
      </header>

      <Ribbon 
        onAddPlayer={() => setIsAddPlayerOpen(true)} 
        onDraftMatch={() => setIsDraftMatchOpen(true)}
        onBulkUpload={triggerBulkUpload}
      />

      <main className="flex-1 relative overflow-hidden">
        {currentView === 'LIVE_QUEUE' && (
          <div className="h-full p-4 flex gap-4 overflow-x-auto">
            <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className="min-w-[300px] w-1/4 h-full">
                <KanbanColumn id="col-available" title="Available" icon={Users} items={players} colorTheme={{ bg: 'bg-gray-200', headerBg: 'bg-gray-300', headerText: 'text-gray-700' }} />
              </div>
              <div className="min-w-[350px] w-1/3 h-full">
                <KanbanColumn id="col-pending" title="Pending Matches" icon={LayoutGrid} items={pendingGames} colorTheme={{ bg: 'bg-slate-200', headerBg: 'bg-slate-300', headerText: 'text-slate-700' }} />
              </div>
              <section className="bg-emerald-100 rounded-lg flex flex-col min-w-[400px] flex-1 shadow-inner border border-emerald-200 overflow-hidden">
                <div className="p-3 bg-emerald-200 font-bold text-emerald-800 flex items-center gap-2 shrink-0">
                  <Activity size={20} /> Active Courts
                </div>
                <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-4 content-start">
                  {courts.map(court => <ActiveCourtCard key={court.id} court={court} />)}
                </div>
              </section>
            </DndContext>
          </div>
        )}

        {currentView === 'PLAYER_ROSTER' && <PlayerRoster />}

        {(currentView === 'HISTORY' || currentView === 'REPORTS') && (
          <div className="h-full flex items-center justify-center bg-white italic text-gray-400">
            Module {currentView} Coming Soon
          </div>
        )}
      </main>

      <AddPlayerModal isOpen={isAddPlayerOpen} onClose={() => setIsAddPlayerOpen(false)} />
      <DraftMatchModal isOpen={isDraftMatchOpen} onClose={() => setIsDraftMatchOpen(false)} />
      <BulkUploadModal isOpen={isBulkOpen} onClose={() => setIsBulkOpen(false)} target={bulkTarget} />
    </div>
  );
}

export default App;
