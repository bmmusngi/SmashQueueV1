import React, { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function EditMemberModal({ isOpen, onClose, member }) {
  const updateMember = useQueueStore(state => state.updateMember);
  const [formData, setFormData] = useState({ name: '', levelWeight: 3, gender: 'M' });

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        levelWeight: member.levelWeight,
        gender: member.gender
      });
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const handleSave = async () => {
    const success = await updateMember(member.id, formData);
    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <User size={18} className="text-indigo-400" />
            <h3 className="font-black uppercase tracking-widest text-xs">Edit Member Profile</h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded-lg transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Full Name</label>
            <input 
              type="text" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Skill Level (1-5)</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none"
                value={formData.levelWeight}
                onChange={(e) => setFormData({...formData, levelWeight: parseInt(e.target.value)})}
              >
                {[1, 2, 3, 4, 5].map(lv => <option key={lv} value={lv}>Level {lv}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1">Gender</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['M', 'F'].map(g => (
                  <button
                    key={g}
                    onClick={() => setFormData({...formData, gender: g})}
                    className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${formData.gender === g ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400'}`}
                  >
                    {g === 'M' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-slate-400 font-black uppercase text-[10px]">Discard</button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg shadow-indigo-200 active:scale-95 transition-all"
          >
            <Save size={14} /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
