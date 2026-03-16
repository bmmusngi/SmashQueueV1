import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2 } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function AddPlayerModal({ isOpen, onClose }) {
  const addPlayer = useQueueStore((state) => state.addPlayer);
  
  const [name, setName] = useState('');
  const [levelWeight, setLevelWeight] = useState(''); // Empty string = null/default
  const [gender, setGender] = useState(''); // Empty string = null/default
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    const payload = {
      name: name.trim(),
      // Send null if not selected so backend can apply defaults
      levelWeight: levelWeight ? parseInt(levelWeight) : null,
      gender: gender || null,
      status: 'ACTIVE',
      paymentStatus: 'UNPAID'
    };

    try {
      await addPlayer(payload);
      
      // Visual feedback loop
      setShowSuccess(true);
      setTimeout(() => {
        setName('');
        setLevelWeight('');
        setGender('');
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 800);
    } catch (error) {
      console.error("Failed to add player:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 bg-indigo-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-indigo-400" />
            <h3 className="font-black uppercase tracking-widest text-xs">Quick Registration</h3>
          </div>
          <button 
            onClick={onClose} 
            className="hover:bg-white/10 p-1 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Field (Required) */}
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
              Player Name <span className="text-rose-500">*</span>
            </label>
            <input
              autoFocus
              required
              type="text"
              placeholder="e.g. Juan Dela Cruz"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Level Field (Optional) */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                Skill Level (Optional)
              </label>
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                value={levelWeight}
                onChange={(e) => setLevelWeight(e.target.value)}
              >
                <option value="">Unknown</option>
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <option key={lvl} value={lvl}>Level {lvl}</option>
                ))}
              </select>
            </div>

            {/* Gender Field (Optional) */}
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-wider">
                Gender (Optional)
              </label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {['M', 'F'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(gender === g ? '' : g)}
                    className={`flex-1 py-2 rounded-lg font-black text-xs transition-all ${
                      gender === g 
                        ? 'bg-white shadow-sm text-indigo-600' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {g === 'M' ? 'Male' : 'Female'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Form Info */}
          <p className="text-[9px] text-slate-400 italic text-center">
            You can always update these details later in the Players tab.
          </p>

          {/* Footer Actions */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95 ${
                showSuccess 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:grayscale'
              }`}
            >
              {showSuccess ? (
                <>
                  <CheckCircle2 size={18} /> Player Added!
                </>
              ) : isSubmitting ? (
                'Processing...'
              ) : (
                <>
                  <UserPlus size={18} /> Register Player
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
