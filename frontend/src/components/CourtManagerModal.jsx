import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function CourtManagerModal({ isOpen, onClose }) {
  const { courts, addCourt, renameCourt, removeCourt } = useQueueStore();
  const [newCourtName, setNewCourtName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');

  if (!isOpen) return null;

  const handleAdd = () => {
    if (newCourtName.trim()) {
      addCourt(newCourtName);
      setNewCourtName('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[120] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="p-4 bg-emerald-900 text-white flex justify-between items-center">
          <h3 className="font-black uppercase tracking-widest text-xs">Manage Courts</h3>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-4">
          {/* List of Courts */}
          <div className="space-y-2">
            {courts.map(court => (
              <div key={court.id} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                {editingId === court.id ? (
                  <input 
                    className="flex-1 px-2 py-1 border rounded font-bold text-sm"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    autoFocus
                  />
                ) : (
                  <span className="flex-1 font-bold text-slate-700 ml-2">{court.name}</span>
                )}
                
                <div className="flex gap-1">
                  {editingId === court.id ? (
                    <button onClick={() => { renameCourt(court.id, editValue); setEditingId(null); }} className="p-2 text-emerald-600"><Check size={16}/></button>
                  ) : (
                    <button onClick={() => { setEditingId(court.id); setEditValue(court.name); }} className="p-2 text-slate-400"><Edit2 size={16}/></button>
                  )}
                  <button onClick={() => removeCourt(court.id)} className="p-2 text-rose-400 hover:text-rose-600"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>

          {/* Add New Court */}
          <div className="pt-4 border-t border-slate-100 flex gap-2">
            <input 
              placeholder="Court Name (e.g. Court 3)"
              className="flex-1 p-2 bg-slate-100 rounded-lg text-sm font-bold outline-none"
              value={newCourtName}
              onChange={(e) => setNewCourtName(e.target.value)}
            />
            <button onClick={handleAdd} className="bg-emerald-600 text-white p-2 rounded-lg"><Plus size={20}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}
