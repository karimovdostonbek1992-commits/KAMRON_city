
import React from 'react';
import { Order, OrderStatus } from '../types';

interface CourierPanelProps {
  orders: Order[];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}

const CourierPanel: React.FC<CourierPanelProps> = ({ orders, onUpdateStatus }) => {
  const deliveryOrders = orders.filter(o => o.type === 'delivery' && o.status !== OrderStatus.COMPLETED);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 px-4">
      <div className="flex items-center gap-3">
        <h2 className="font-bold text-xl text-slate-800">Yetkazib Beruvchi Paneli</h2>
        <span className="bg-slate-100 text-slate-500 px-2 py-1 rounded text-[10px] font-bold">{deliveryOrders.length} TA</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliveryOrders.length === 0 ? (
          <div className="col-span-2 py-20 bg-white rounded-[3rem] border border-slate-50 text-center">
            <p className="text-slate-300 font-medium italic">Faol buyurtmalar yo'q</p>
          </div>
        ) : (
          deliveryOrders.map(order => (
            <div key={order.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:shadow-lg transition-all">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="font-bold text-slate-900 tracking-tight">Buyurtma #{order.id}</h4>
                  <p className="text-xs text-slate-400 font-medium">{order.customerName}</p>
                </div>
                <div className="text-right">
                    <p className="text-indigo-600 font-bold">{order.total.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8 text-sm font-medium text-slate-600">
                <p className="flex items-center gap-2">📍 <span className="opacity-80">{order.address}</span></p>
                <p className="flex items-center gap-2">📞 <span className="opacity-80">{order.phone}</span></p>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => onUpdateStatus(order.id, OrderStatus.DELIVERING)}
                  disabled={order.status === OrderStatus.DELIVERING}
                  className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold active:scale-95 transition-all disabled:opacity-20"
                >
                  Yo'lga Chiqdim
                </button>
                <button 
                  onClick={() => onUpdateStatus(order.id, OrderStatus.COMPLETED)}
                  className="flex-1 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold active:scale-95 transition-all"
                >
                  Yakunlandi
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourierPanel;
