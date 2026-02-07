
import React from 'react';
import { Order, OrderStatus } from '../types';

interface OrderTrackerProps {
  order: Order;
}

const OrderTracker: React.FC<OrderTrackerProps> = ({ order }) => {
  const steps = [
    { label: 'Kutilmoqda', status: OrderStatus.PENDING },
    { label: 'Tayyor', status: OrderStatus.ACCEPTED },
    { label: 'Yo\'lda', status: OrderStatus.DELIVERING },
    { label: 'Yakunlandi', status: OrderStatus.COMPLETED },
  ];

  const currentIdx = steps.findIndex(s => s.status === order.status);

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">#{order.id}</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{order.type === 'delivery' ? 'Yetkazib berish' : 'Xona bandi'}</p>
        </div>
        <div className="text-right"><p className="text-2xl font-bold text-indigo-600">{order.total.toLocaleString()}</p></div>
      </div>

      <div className="relative flex justify-between items-center mb-10">
        <div className="absolute h-[1px] bg-slate-50 w-full top-1/2 -translate-y-1/2 -z-0"></div>
        <div 
          className="absolute h-[2px] bg-indigo-500 top-1/2 -translate-y-1/2 -z-0 transition-all duration-1000"
          style={{ width: `${(currentIdx / (steps.length - 1)) * 100}%` }}
        ></div>
        
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col items-center z-10">
            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-700 ${
              idx <= currentIdx ? 'bg-indigo-600 border-indigo-600 scale-125' : 'bg-white border-slate-100'
            }`}></div>
            <span className={`text-[8px] mt-3 font-bold uppercase tracking-tighter ${idx <= currentIdx ? 'text-indigo-600' : 'text-slate-300'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl mb-6">
        <p className="text-xs font-bold text-center text-slate-600">{order.status}</p>
      </div>

      <div className="space-y-2">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex justify-between text-[11px] font-medium text-slate-400">
            <span>{item.name} x{item.quantity}</span>
            <span>{(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderTracker;
