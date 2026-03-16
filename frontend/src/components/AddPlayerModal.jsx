import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import useQueueStore from '../store/useQueueStore';

export default function AddPlayerModal({ isOpen, onClose }) {
  const addPlayer = useQueueStore((state) => state.addPlayer);

  // Form State
  const [name, setName] = useState('');
  const [levelWeight, setLevelWeight] = useState(1);
  const [gender, setGender] = useState('M');
  const [paymentStatus, setPaymentStatus] = useState('UNPAID');
  const [paymentMode, setPaymentMode] = useState('Cash');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Construct the new player object
    const newPlayer = {
      name: name.trim(),
      levelWeight: Number(levelWeight),
      gender,
      status: 'ACTIVE',
      paymentStatus,
      // Only attach payment mode if they actually paid
      paymentMode: paymentStatus === 'PAID' ? paymentMode : null, 
    };

    addPlayer(newPlayer);
    
    // Reset form and close modal
    setName('');
    setLevelWeight(1);
    setGender('M');
    setPaymentStatus('UNPAID');
    setPaymentMode('Cash');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 touch-none">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2 font-bold text-lg">
            <UserPlus size={20} />
            Add New Player
          </div>
          <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Name & Gender Row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Player Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. Juan"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
              <select 
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Skill Level (Palag Weight)</label>
            <select 
              value={levelWeight}
              onChange={(e) => setLevelWeight(e.target.value)}
              className="w-full border border-gray-300 rounded p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
            >
              <option value="1">Beginner (1)</option>
              <option value="2">Intermediate (2)</option>
              <option value="3">Advanced (3)</option>
              <option value="4">Expert (4)</option>
              <option value="5">VIP (5)</option>
            </select>
          </div>

          {/* Payment Section */}
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Entrance Fee Status</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  value="UNPAID"
                  checked={paymentStatus === 'UNPAID'}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-red-600">Unpaid</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="payment" 
                  value="PAID"
                  checked={paymentStatus === 'PAID'}
                  onChange={(e) => setPaymentStatus(e.target.value)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-green-600">Paid</span>
              </label>
            </div>

            {/* Conditionally render Payment Mode based on Paid status */}
            <div className={`transition-opacity ${paymentStatus === 'PAID' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <label className="block text-xs text-gray-500 mb-1">Mode of Payment</label>
              <select 
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                disabled={paymentStatus === 'UNPAID'}
                className="w-full border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
              >
                <option value="Cash">Cash</option>
                <option value="GCash">GCash</option>
                <option value="QRPH">QRPH</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold shadow-md transition-colors"
            >
              Add to Queue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
