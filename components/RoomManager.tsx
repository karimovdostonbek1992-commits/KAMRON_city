
import React, { useState } from 'react';
import { TableRoom } from '../types';

interface RoomManagerProps {
  rooms: TableRoom[];
  onDeleteRoom: (id: string) => void;
  onAddRoom: (room: Omit<TableRoom, 'id'>) => void;
  onUpdatePrice: (id: string, price: number) => void;
  onUpdateImage: (id: string, newImage: string) => void;
}

const RoomManager: React.FC<RoomManagerProps> = ({ rooms, onDeleteRoom, onAddRoom, onUpdatePrice, onUpdateImage }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newRoom, setNewRoom] = useState({ name: '', capacity: 4, price: 0, image: '', isAvailable: true });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean, id?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        isNew ? setNewRoom({ ...newRoom, image: base64 }) : id && onUpdateImage(id, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 px-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-slate-800">Xonalar Boshqaruvi</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          {isAdding ? 'Bekor qilish' : '+ Yangi Xona'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={(e) => { e.preventDefault(); onAddRoom(newRoom); setIsAdding(false); }} className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 max-w-2xl mx-auto space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Xona nomi" className="px-5 py-3 rounded-xl bg-white outline-none text-sm font-medium" onChange={e => setNewRoom({...newRoom, name: e.target.value})} />
            <input type="number" required placeholder="Sig'imi" className="px-5 py-3 rounded-xl bg-white outline-none text-sm font-medium" onChange={e => setNewRoom({...newRoom, capacity: Number(e.target.value)})} />
            <input type="number" required placeholder="Narxi" className="px-5 py-3 rounded-xl bg-white outline-none text-sm font-medium col-span-2" onChange={e => setNewRoom({...newRoom, price: Number(e.target.value)})} />
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="col-span-2 text-[10px]" />
          </div>
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition-all">Qo'shish</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map(room => (
          <div key={room.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="relative h-48 overflow-hidden">
                <img src={room.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <label className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <span className="px-4 py-2 bg-white/90 rounded-xl text-[10px] font-bold uppercase tracking-widest">Rasmni O'zgartirish</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false, room.id)} />
                </label>
            </div>
            <div className="p-8">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-slate-900">{room.name}</h4>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{room.capacity} kishi</span>
              </div>
              <div className="mb-6">
                <input type="number" className="w-full bg-slate-50 px-4 py-2 rounded-xl font-bold text-indigo-600 text-sm outline-none" defaultValue={room.price} onBlur={(e) => onUpdatePrice(room.id, Number(e.target.value))} />
              </div>
              <button 
                onClick={() => confirm('Xonani ochirish?') && onDeleteRoom(room.id)}
                className="w-full py-3.5 text-slate-300 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest"
              >
                O'chirish
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomManager;
