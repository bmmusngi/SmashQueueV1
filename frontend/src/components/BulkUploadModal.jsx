import React, { useState } from 'react';
import { X, Upload, Info } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function BulkUploadModal({ isOpen, onClose, target }) {
  const [rawData, setRawData] = useState('');
  const bulkUpload = useQueueStore(s => s.bulkUpload);

  if (!isOpen) return null;

  const handleUpload = async () => {
    // Basic Parsing: Name, Weight, Gender (one per line)
    const lines = rawData.split('\n').filter(line => line.trim() !== '');
    const players = lines.map(line => {
      const [name, levelWeight, gender] = line.split(',').map(s => s.trim());
      return { 
        name, 
        levelWeight: parseInt(levelWeight) || 3, 
        gender: gender?.toUpperCase() || 'M' 
      };
    });

    const success = await bulkUpload(players, target);
    if (success) {
      setRawData('');
      onClose();
    } else {
      alert("Something went wrong with the upload.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-4 bg-indigo-900 text-white flex justify-between items-center">
          <h3 className="font-bold">Bulk Upload to {target === 'GLOBAL' ? 'Global Roster' : 'Current Session'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 p-3 rounded-lg flex gap-3 mb-4 text-xs text-blue-700">
            <Info size={20} className="shrink-0" />
            <p>Paste your list below. Format: <b>Name, Weight, Gender</b> (one per line). <br/>Example: <i>Juan Dela Cruz, 4, M</i></p>
          </div>
          <textarea 
            className="w-full h-48 border border-gray-200 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Juan Dela Cruz, 4, M&#10;Maria Clara, 3, F"
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button onClick={onClose} className="px-4 py-2 text-gray-500 font-bold">Cancel</button>
            <button 
              onClick={handleUpload}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold flex items-center gap-2"
            >
              <Upload size={18} /> Process Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
