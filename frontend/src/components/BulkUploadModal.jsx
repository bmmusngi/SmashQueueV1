import { useState } from 'react';
import { X, Upload, Info } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';



export default function BulkUploadModal({ isOpen, onClose, target }) {
  const [rawData, setRawData] = useState('');
  const bulkUpload = useQueueStore((state) => state.bulkUpload);

  // If the modal isn't open, don't render anything
  if (!isOpen) return null;

  const handleUpload = async () => {
    if (!rawData.trim()) {
      alert("Please paste some data first.");
      return;
    }

    try {
      // Parsing logic: Split by lines, then by commas
      const lines = rawData.split('\n').filter(line => line.trim() !== '');
      const players = lines.map(line => {
        const parts = line.split(',').map(s => s.trim());
        
        // Basic validation: Name is required
        const name = parts[0];
        const levelWeight = parseInt(parts[1]) || 3;
        const gender = (parts[2] || 'M').toUpperCase();

        return { name, levelWeight, gender };
      });

      if (players.length === 0) return;

      const success = await bulkUpload(players, target);
      if (success) {
        setRawData('');
        onClose();
      }
    } catch (err) {
      console.error("Parsing error:", err);
      alert("Format error. Please use: Name, Weight, Gender");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="p-4 bg-indigo-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Upload size={20} className="text-indigo-300" />
            <h3 className="font-bold">
              Bulk {target === 'GLOBAL' ? 'Registration' : 'Session Add'}
            </h3>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Instructions */}
          <div className="bg-indigo-50 p-3 rounded-lg flex gap-3 mb-4 text-xs text-indigo-700 border border-indigo-100">
            <Info size={20} className="shrink-0 text-indigo-500" />
            <div>
              <p className="font-bold mb-1">Instructions:</p>
              <p>Paste list: <b>Name, Weight, Gender</b> (one per line).</p>
              <p className="mt-1 font-mono bg-white/50 p-1 rounded italic">Example: Juan Dela Cruz, 4, M</p>
            </div>
          </div>

          {/* Text Area */}
          <textarea 
            className="w-full h-48 border border-gray-200 rounded-lg p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50"
            placeholder="Juan Dela Cruz, 4, M&#10;Maria Clara, 3, F"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
          />

          {/* Footer Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpload}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg active:scale-95 transition-all"
            >
              <Upload size={18} /> Run Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
