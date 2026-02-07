
import React, { useState } from 'react';
import { Product, StockStatus } from '../types';
import { CATEGORIES } from '../constants';

interface InventoryManagerProps {
  products: Product[];
  onToggleStock: (id: string) => void;
  onUpdatePrice: (id: string, newPrice: number) => void;
  onDeleteProduct: (id: string) => void;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateImage: (id: string, newImage: string) => void;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  products, onToggleStock, onUpdatePrice, onDeleteProduct, onAddProduct, onUpdateImage
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', price: 0, category: 'Asosiy Taomlar', image: '', status: StockStatus.IN_STOCK });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean, id?: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        isNew ? setNewProd({ ...newProd, image: base64 }) : id && onUpdateImage(id, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProd.image) return alert("Rasm yuklang");
    onAddProduct(newProd);
    setNewProd({ name: '', price: 0, category: 'Asosiy Taomlar', image: '', status: StockStatus.IN_STOCK });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center px-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Taomlar Ro'yxati</h2>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all"
        >
          {isAdding ? 'Bekor Qilish' : '+ Yangi Taom'}
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleAdd} className="bg-slate-50 p-8 rounded-3xl space-y-6 max-w-2xl mx-auto border border-slate-100">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Nomi" className="px-5 py-3 rounded-xl bg-white outline-none text-sm" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} />
            <input type="number" required placeholder="Narxi" className="px-5 py-3 rounded-xl bg-white outline-none text-sm" value={newProd.price || ''} onChange={e => setNewProd({...newProd, price: Number(e.target.value)})} />
            <select className="col-span-2 px-5 py-3 rounded-xl bg-white outline-none text-sm" value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} className="col-span-2 text-xs" />
          </div>
          <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-bold active:scale-95 transition-all">Qo'shish</button>
        </form>
      )}

      <div className="bg-white rounded-[2rem] border border-slate-50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Taom</th>
              <th className="px-8 py-5">Kategoriya</th>
              <th className="px-8 py-5">Narxi</th>
              <th className="px-8 py-5 text-center">Holati</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map(p => (
              <tr key={p.id} className="group hover:bg-slate-50/30 transition-colors">
                <td className="px-8 py-6 flex items-center gap-4">
                  <div className="relative group/img">
                    <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center rounded-xl cursor-pointer transition-opacity">
                        <span className="text-[8px] text-white font-bold">RASM</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false, p.id)} />
                    </label>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{p.name}</span>
                </td>
                <td className="px-8 py-6"><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{p.category}</span></td>
                <td className="px-8 py-6">
                    <input type="number" className="w-24 bg-transparent font-bold text-indigo-600 outline-none" defaultValue={p.price} onBlur={(e) => onUpdatePrice(p.id, Number(e.target.value))} />
                </td>
                <td className="px-8 py-6 text-center">
                    <button onClick={() => onToggleStock(p.id)} className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase transition-all ${p.status === StockStatus.IN_STOCK ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-400'}`}>
                      {p.status}
                    </button>
                </td>
                <td className="px-8 py-6 text-right">
                    <button onClick={() => confirm('Ochirish?') && onDeleteProduct(p.id)} className="text-slate-200 hover:text-red-500 transition-colors text-xs font-bold opacity-0 group-hover:opacity-100">O'chirish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryManager;
