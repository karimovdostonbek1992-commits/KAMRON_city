import React, { useState, useMemo } from 'react';
import { 
  Product, TableRoom, Order, OrderStatus, 
  StockStatus, OrderType, OrderItem 
} from './types';
import { 
  MOCK_PRODUCTS, MOCK_TABLES, CATEGORIES 
} from './constants';
import InventoryManager from './components/InventoryManager';
import RoomManager from './components/RoomManager';
import CourierPanel from './components/CourierPanel';
import OrderTracker from './components/OrderTracker';

// MAXFIY KODLAR
const SECRET_AREA_CODE = "mx097aixom";
const ADMIN_CODE = "11wer9hk";
const MANAGER_CODE = "189sidnetbosss";
const COURIER_CODE = "buysel78ui";

const App: React.FC = () => {
  // NAVIGATION & AUTH STATES
  const [view, setView] = useState<'customer' | 'secret'>('customer');
  const [custTab, setCustTab] = useState<'menu' | 'reservation' | 'status'>('menu');
  const [activeRole, setActiveRole] = useState<'manager' | 'admin' | 'courier' | null>(null);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState(false);
  const [authInput, setAuthInput] = useState('');

  // DATA STATES
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [tables, setTables] = useState<TableRoom[]>(MOCK_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  
  // FORM STATES
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [selectedTable, setSelectedTable] = useState<TableRoom | null>(null);

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  // HANDLERS
  const handleAuth = () => {
    if (!isSecretUnlocked) {
      if (authInput === SECRET_AREA_CODE) {
        setIsSecretUnlocked(true);
        setAuthInput('');
      } else { alert("Tizim kodi xato!"); }
    } else {
      if (authInput === MANAGER_CODE) setActiveRole('manager');
      else if (authInput === ADMIN_CODE) setActiveRole('admin');
      else if (authInput === COURIER_CODE) setActiveRole('courier');
      else { alert("Shaxsiy parol xato!"); }
      setAuthInput('');
    }
  };

  const addToCart = (product: Product) => {
    if (product.status === StockStatus.OUT_OF_STOCK) return;
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const placeOrder = (type: OrderType) => {
    if (!customerName || !phone) return alert("Ma'lumotlarni to'ldiring");
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      type, items: [...cart], total: cartTotal + (selectedTable?.price || 0),
      status: OrderStatus.PENDING, customerName, phone, address,
      tableId: selectedTable?.id, createdAt: new Date(),
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCustTab('status');
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* HEADER */}
      <header className="border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="text-xl font-bold tracking-tighter">KAMRON</div>
        <div className="space-x-2">
          <button onClick={() => setView('customer')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'customer' ? 'bg-slate-100' : ''}`}>Mijoz</button>
          <button onClick={() => setView('secret')} className={`px-4 py-2 rounded-lg text-sm font-medium ${view === 'secret' ? 'bg-black text-white' : ''}`}>Panel</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        {view === 'customer' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* TABS */}
            <div className="flex space-x-4 border-b border-slate-100 mb-8">
              {['menu', 'reservation', 'status'].map((t) => (
                <button key={t} onClick={() => setCustTab(t as any)} className={`pb-4 text-sm font-semibold capitalize ${custTab === t ? 'border-b-2 border-black text-black' : 'text-slate-400'}`}>
                  {t === 'menu' ? 'Taomlar' : t === 'reservation' ? 'Xonalar' : 'Holat'}
                </button>
              ))}
            </div>

            {custTab === 'menu' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-10">
                  {CATEGORIES.map(cat => (
                    <section key={cat}>
                      <h3 className="text-lg font-bold mb-4">{cat}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {products.filter(p => p.category === cat).map(p => (
                          <div key={p.id} className="border border-slate-100 p-4 rounded-2xl flex gap-4 hover:border-slate-300 transition-colors">
                            <img src={p.image} className="w-20 h-20 object-cover rounded-xl bg-slate-50" />
                            <div className="flex-grow">
                              <h4 className="font-bold text-sm">{p.name}</h4>
                              <p className="text-indigo-600 font-bold text-xs">{p.price.toLocaleString()} so'm</p>
                              <button onClick={() => addToCart(p)} className="mt-2 text-[10px] font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg uppercase">Qo'shish</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                {/* CART SIDEBAR */}
                <div className="bg-slate-50 p-6 rounded-3xl h-fit sticky top-24">
                  <h3 className="font-bold mb-4">Savatcha</h3>
                  {cart.map(item => (
                    <div key={item.productId} className="flex justify-between text-xs mb-2">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-bold">{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="border-t border-slate-200 mt-4 pt-4">
                    <div className="flex justify-between font-bold mb-4"><span>Jami:</span><span>{cartTotal.toLocaleString()}</span></div>
                    <input placeholder="Ismingiz" className="w-full p-3 rounded-xl mb-2 text-sm border-none shadow-sm" onChange={e => setCustomerName(e.target.value)} />
                    <input placeholder="Telefon" className="w-full p-3 rounded-xl mb-4 text-sm border-none shadow-sm" onChange={e => setPhone(e.target.value)} />
                    <button onClick={() => placeOrder('delivery')} className="w-full bg-black text-white py-3 rounded-xl font-bold">Tasdiqlash</button>
                  </div>
                </div>
              </div>
            )}

            {custTab === 'status' && (
              <div className="max-w-xl mx-auto space-y-4">
                {orders.length === 0 ? <p className="text-center text-slate-400 py-20">Buyurtmalar yo'q</p> : 
                  orders.map(o => <OrderTracker key={o.id} order={o} />)}
              </div>
            )}
          </div>
        ) : (
          /* SECRET PANELS */
          <div className="max-w-4xl mx-auto">
            {!activeRole ? (
              <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-6">{!isSecretUnlocked ? "Tizim Kirish" : "Shaxsiy Parol"}</h2>
                <input type="password" value={authInput} onChange={e => setAuthInput(e.target.value)} className="border border-slate-200 p-4 rounded-2xl w-64 text-center tracking-widest mb-4 outline-none focus:border-black" placeholder="••••••••" />
                <br />
                <button onClick={handleAuth} className="bg-black text-white px-10 py-3 rounded-2xl font-bold">Kirish</button>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-bold capitalize">{activeRole} Paneli</h2>
                  <button onClick={() => {setActiveRole(null); setIsSecretUnlocked(false)}} className="text-xs font-bold text-red-500">CHIQISH</button>
                </div>
                {activeRole === 'manager' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="p-6 bg-indigo-50 rounded-3xl">
                      <p className="text-xs font-bold text-indigo-400 uppercase">Kunlik Tushum</p>
                      <h3 className="text-2xl font-bold text-indigo-700">12,450,000</h3>
                    </div>
                    {/* Boshliq uchun boshqa statlar shu yerda */}
                  </div>
                )}
                {activeRole === 'admin' && <InventoryManager products={products} onToggleStock={(id) => {}} onUpdatePrice={(id, p) => {}} onDeleteProduct={() => {}} onAddProduct={() => {}} onUpdateImage={() => {}} />}
                {activeRole === 'courier' && <CourierPanel orders={orders} onUpdateStatus={updateOrderStatus} />}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
