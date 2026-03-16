import React, { useState } from 'react';
import {
  DndContext,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Users, LayoutGrid, Activity } from 'lucide-react';

// Store & Components
import useQueueStore from './store/useQueueStore';
import KanbanColumn from './components/KanbanColumn';
import ActiveCourtCard from './components/ActiveCourtCard';
import AddPlayerModal from './components/AddPlayerModal';
import DraftMatchModal from './components/DraftMatchModal';

function App() {
  // 1. Local State for Modals
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isDraftMatchOpen, setIsDraftMatchOpen] = useState(false);

  // 2. Pull the state directly from our Zustand store
  const players = useQueueStore((state) => state.players);
  const pendingGames = useQueueStore((state) => state.pendingGames);
  const courts = useQueueStore((state) => state.courts);
  const sessionId = useQueueStore((state) => state.sessionId);
  const assignGameToCourt = useQueueStore((state) => state.assignGameToCourt);

  // 3. Configure Sensors (Crucial for Tablet/Touch support)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 4. Handle the drop event
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    // If dropped outside a valid drop zone, snap it back
    if (!over) return;

    // Retrieve the custom data we attached to our draggable components
    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // SCENARIO: Dragging a Pending Game onto an Active Court
    if (activeType === 'PendingGame' && overType === 'Court') {
      const gameId = active.id;
      const courtId = over.data.current.court.id;
      
      assignGameToCourt(gameId, courtId);
    }
    
    // Future Scenario: Reordering lists, dragging players back to the pool, etc.
  };

  // 5. Themes
  const availableTheme = { bg: 'bg-gray-200', headerBg: 'bg-gray-300', headerText: 'text-gray-700' };
  const pendingTheme = { bg: 'bg-slate-200', headerBg: 'bg-slate-300', headerText: 'text-slate-700' };

  return (
    <div className="h-screen w-full flex flex-col bg-slate-100 font-sans relative">
      {/* Header */}
      <header className="bg-indigo-900 text-white p-4 flex justify-between items-center shadow-md shrink-0 z-10">
        <div>
          <h1 className="text-xl font-bold">🏸 Badminton Queue Manager</h1>
          <p className="text-sm text-indigo-200">Session ID: {sessionId || '2026031501A7B2'}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsDraftMatchOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            Draft Match
          </button>
          <button className="bg-indigo-700 hover:bg-indigo-600 px-4 py-2 rounded font-medium transition-colors hidden md:block">
            Queue Settings
          </button>
        </div>
      </header>

      {/* Main Board */}
      <main className="flex-1 flex gap-4 p-4 overflow-x-auto relative">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          {/* Column 1: Available Players */}
          <div className="min-w-[300px] w-1/4">
            <KanbanColumn id="col-available" title="Available Players" icon={Users} items={players} colorTheme={availableTheme} />
          </div>

          {/* Column 2: Pending Games */}
          <div className="min-w-[350px] w-1/3">
            <KanbanColumn id="col-pending" title="Pending Games" icon={LayoutGrid} items={pendingGames} colorTheme={pendingTheme} />
          </div>

          {/* Column 3: Active Courts */}
          <section className="bg-emerald-100 rounded-lg flex flex-col min-w-[400px] flex-1 shadow-inner overflow-hidden">
            <div className="p-3 bg-emerald-200 rounded-t-lg font-bold text-emerald-800 flex items-center gap-2 shrink-0">
              <Activity size={20} />
              Active Courts
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-4">
              {courts.map(court => (
                <ActiveCourtCard key={court.id} court={court} />
              ))}
              {courts.length === 0 && (
                <p className="text-center text-emerald-600 text-sm mt-4 italic col-span-full">No courts configured for this session.</p>
              )}
            </div>
          </section>
        </DndContext>
      </main>

      {/* FAB for Adding Players */}
      <button 
        onClick={() => setIsAddPlayerOpen(true)}
        className="absolute bottom-6 right-6 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 flex items-center justify-center text-3xl font-bold w-14 h-14 z-40 transition-transform active:scale-95"
        title="Add Player"
      >
        +
      </button>

      {/* Modals */}
      <AddPlayerModal isOpen={isAddPlayerOpen} onClose={() => setIsAddPlayerOpen(false)} />
      <DraftMatchModal isOpen={isDraftMatchOpen} onClose={() => setIsDraftMatchOpen(false)} />
    </div>
  );
}

export default App;
