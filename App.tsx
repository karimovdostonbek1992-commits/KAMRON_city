
import React, { useState, useMemo } from 'react';
import { 
  Product, 
  TableRoom, 
  Order, 
  OrderStatus, 
  StockStatus, 
  OrderType,
  OrderItem 
} from './types';
import { 
  MOCK_PRODUCTS, 
  MOCK_TABLES, 
  MOCK_SALES, 
  CATEGORIES 
} from './constants';
import InventoryManager from './components/InventoryManager';
import RoomManager from './components/RoomManager';
import CourierPanel from './components/CourierPanel';
import OrderTracker from './components/OrderTracker';
import { getAIAnalytics } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

type View = 'customer' | 'secret';
type CustomerTab = 'menu' | 'reservation' | 'status';
type SecretRole = 'manager' | 'admin' | 'courier';

interface DeviceInfo {
  id: string;
  name: string;
  location: string;
  lastActive: string;
  type: 'mobile' | 'desktop';
  ip: string;
}

const SECRET_AREA_CODE = "mx097aixom";
const ADMIN_CODE = "11wer9hk";
const MANAGER_CODE = "189sidnetbosss";
const COURIER_CODE = "buysel78ui";

const App: React.FC = () => {
  const [isSecretAreaUnlocked, setIsSecretAreaUnlocked] = useState(false);
  const [activeRole, setActiveRole] = useState<SecretRole | null>(null);
  const [pendingRole, setPendingRole] = useState<SecretRole | null>(null);
  const [authInput, setAuthInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [devices, setDevices] = useState<DeviceInfo[]>([
    { id: 'dev1', name: 'iPhone 15 Pro (Boshliq)', location: 'Toshkent', lastActive: 'Hozir faol', type: 'mobile', ip: '192.168.1.15' },
    { id: 'dev2', name: 'MacBook Air (Admin)', location: 'Samarqand', lastActive: '2 daqiqa oldin', type: 'desktop', ip: '192.168.1.2' },
  ]);

  const [view, setView] = useState<View>('customer');
  const [custTab, setCustTab] = useState<CustomerTab>('menu');
  const [adminSection, setAdminSection] = useState<'inventory' | 'rooms'>('inventory');
  
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [tables, setTables] = useState<TableRoom[]>(MOCK_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  
  const [selectedTable, setSelectedTable] = useState<TableRoom | null>(null);
  const [preOrder, setPreOrder] = useState<boolean | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const handleUnlockSecretArea = () => {
    if (authInput === SECRET_AREA_CODE) {
      setIsSecretAreaUnlocked(true);
      setAuthInput('');
      setAuthError('');
    } else {
      setAuthError('Kiritilgan kod noto\'g\'ri');
    }
  };

  const handleRoleSelect = (role: SecretRole) => {
    setPendingRole(role);
    setAuthInput('');
    setAuthError('');
  };

  const handleRoleAuth = () => {
    const codes = { manager: MANAGER_CODE, admin: ADMIN_CODE, courier: COURIER_CODE };
    if (pendingRole && authInput === codes[pendingRole]) {
      setActiveRole(pendingRole);
      setPendingRole(null);
      setAuthInput('');
      setAuthError('');
    } else {
      setAuthError('Ruxsat kodi noto\'g\'ri');
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
    if (!customerName || !phone || (type === 'delivery' && !address)) {
      alert("Ma'lumotlarni to'liq to'ldiring");
      return;
    }
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      type,
      items: [...cart],
      total: cartTotal + (selectedTable?.price || 0),
      status: OrderStatus.PENDING,
      customerName,
      phone,
      address,
      tableId: selectedTable?.id,
      createdAt: new Date(),
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setSelectedTable(null);
    setPreOrder(null);
    setCustTab('status');
  };

  const updateOrderStatus = (id: string, newStatus: OrderStatus) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  const toggleStock = (id: string) => setProducts(prev => prev.map(p => p.id === id ? { ...p, status: p.status === StockStatus.IN_STOCK ? StockStatus.OUT_OF_STOCK : StockStatus.IN_STOCK } : p));
  const updatePrice = (id: string, newPrice: number) => setProducts(prev => prev.map(p => p.id === id ? { ...p, price: newPrice } : p));
  const updateProductImage = (id: string, newImage: string) => setProducts(prev => prev.map(p => p.id === id ? { ...p, image: newImage } : p));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const addProduct = (p: Omit<Product, 'id'>) => setProducts([{ ...p, id: Math.random().toString(36).substr(2, 6) }, ...products]);
  const deleteRoom = (id: string) => setTables(prev => prev.filter(t => t.id !== id));
  const addRoom = (r: Omit<TableRoom, 'id'>) => setTables([{ ...r, id: Math.random().toString(36).substr(2, 6) }, ...tables]);
  const updateRoomPrice = (id: string, price: number) => setTables(prev => prev.map(t => t.id === id ? { ...t, price } : t));
  const updateRoomImage = (id: string, image: string) => setTables(prev => prev.map(t => t.id === id ? { ...t, image } : t));

  const handleGenerateReport = async () => {
    setLoadingAi(true);
    const report = await getAIAnalytics(MOCK_SALES);
    setAiReport(report);
    setLoadingAi(false);
  };

  const AuthBox = ({ title, placeholder, onAuth, onBack }: { title: string, placeholder: string, onAuth: () => void, onBack?: () => void }) => (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-slate-100 max-w-sm mx-auto shadow-sm animate-in fade-in duration-500">
      <h3 className="text-xl font-bold mb-6 text-slate-800 tracking-tight">{title}</h3>
      <div className="w-full px-8 space-y-4">
        <input 
          type="password" 
          placeholder={placeholder} 
          className="w-full px-5 py-3.5 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-1 focus:ring-indigo-200 text-center tracking-widest font-medium transition-all" 
          value={authInput} 
          onChange={e => setAuthInput(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && onAuth()}
        />
        {authError && <p className="text-red-500 text-xs text-center font-semibold">{authError}</p>}
        <button onClick={onAuth} className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all">Kirish</button>
        {onBack && <button onClick={onBack} className="w-full text-slate-400 text-xs font-semibold hover:text-slate-600 transition-colors">Orqaga</button>}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      <header className="bg-white/70 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform duration-500">K</div>
            <span className="text-xl font-extrabold tracking-tighter text-slate-900">KAMRON</span>
          </div>
          
          <nav className="flex items-center gap-2">
            <button onClick={() => setView('customer')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'customer' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:text-slate-800'}`}>Mijoz</button>
            <button onClick={() => setView('secret')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'secret' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>Panel</button>
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full p-6 lg:p-10">
        {view === 'customer' ? (
          <div className="space-y-12 fade-up">
            <div className="flex bg-white/50 p-1 rounded-2xl border border-slate-100 max-w-md mx-auto">
              <button onClick={() => setCustTab('menu')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${custTab === 'menu' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400'}`}>Yetkazish</button>
              <button onClick={() => setCustTab('reservation')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${custTab === 'reservation' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400'}`}>Xona Band Qilish</button>
              <button onClick={() => setCustTab('status')} className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all ${custTab === 'status' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-400'}`}>Mening Buyurtmalarim</button>
            </div>

            {custTab === 'menu' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                <div className="lg:col-span-3 space-y-16">
                  {CATEGORIES.map(cat => (
                    <section key={cat} className="animate-in fade-in duration-700">
                      <h3 className="text-lg font-bold mb-8 text-slate-800 flex items-center gap-3">
                        <span className="w-1 h-1 bg-indigo-600 rounded-full"></span> {cat}
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        {products.filter(p => p.category === cat).map(p => (
                          <div key={p.id} className="group bg-white rounded-3xl border border-slate-50 overflow-hidden flex transition-all hover:shadow-xl hover:shadow-slate-100">
                            <div className="w-32 h-32 overflow-hidden shrink-0">
                                <img src={p.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            </div>
                            <div className="p-6 flex-grow flex flex-col justify-between">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-slate-900 leading-tight">{p.name}</h4>
                                <span className="text-xs font-bold text-indigo-600">{p.price.toLocaleString()}</span>
                              </div>
                              <button 
                                onClick={() => addToCart(p)} 
                                disabled={p.status === StockStatus.OUT_OF_STOCK}
                                className={`w-full py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${p.status === StockStatus.IN_STOCK ? 'bg-slate-900 text-white hover:bg-indigo-600' : 'bg-slate-100 text-slate-400'}`}
                              >
                                {p.status === StockStatus.IN_STOCK ? '+ Savatchaga' : 'Tugagan'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-white p-8 rounded-[2rem] border border-slate-100 sticky top-32">
                    <h3 className="text-lg font-bold mb-8">Savatcha</h3>
                    {cart.length === 0 ? <p className="text-center py-12 text-slate-300 text-sm italic">Hozircha bo'sh</p> : (
                      <div className="space-y-6 mb-8 custom-scrollbar max-h-60 overflow-y-auto pr-2">
                        {cart.map(item => (
                          <div key={item.productId} className="flex justify-between text-sm">
                            <span className="font-medium text-slate-600">{item.name} x{item.quantity}</span>
                            <span className="font-bold text-slate-900">{item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-slate-50 pt-6 space-y-6">
                      <div className="flex justify-between text-xl font-bold"><span>Jami:</span><span className="text-indigo-600">{cartTotal.toLocaleString()}</span></div>
                      <div className="space-y-3">
                        <input type="text" placeholder="Ismingiz" className="w-full px-5 py-3 bg-slate-50 rounded-xl outline-none text-sm transition-all focus:bg-white focus:ring-1 focus:ring-indigo-100" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                        <input type="tel" placeholder="Telefon" className="w-full px-5 py-3 bg-slate-50 rounded-xl outline-none text-sm transition-all focus:bg-white focus:ring-1 focus:ring-indigo-100" value={phone} onChange={e => setPhone(e.target.value)} />
                        <textarea placeholder="Manzil" rows={2} className="w-full px-5 py-3 bg-slate-50 rounded-xl outline-none text-sm transition-all focus:bg-white focus:ring-1 focus:ring-indigo-100 resize-none" value={address} onChange={e => setAddress(e.target.value)} />
                      </div>
                      <button onClick={() => placeOrder('delivery')} disabled={cart.length === 0} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all disabled:opacity-30">Buyurtmani Tasdiqlash</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {custTab === 'reservation' && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                  {tables.map(table => (
                    <div key={table.id} onClick={() => setSelectedTable(table)} className={`cursor-pointer group rounded-[2.5rem] overflow-hidden border-2 transition-all duration-500 ${selectedTable?.id === table.id ? 'border-indigo-600 bg-white scale-[1.02]' : 'border-transparent bg-white hover:bg-slate-50'}`}>
                      <div className="h-44 overflow-hidden"><img src={table.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" /></div>
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-2"><h4 className="font-bold text-slate-800">{table.name}</h4><span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full font-bold uppercase">{table.capacity} kishi</span></div>
                        <p className="text-sm text-indigo-600 font-bold">{table.price > 0 ? `${table.price.toLocaleString()} so'm` : 'Bepul'}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTable && (
                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-2xl font-bold mb-10 text-slate-900">Band qilish: {selectedTable.name}</h3>
                    <div className="flex gap-4 mb-10 max-w-xl">
                      <button onClick={() => setPreOrder(true)} className={`flex-1 py-5 rounded-3xl font-bold border-2 transition-all ${preOrder === true ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-400'}`}>Oldindan Taom Buyurtma Berish</button>
                      <button onClick={() => setPreOrder(false)} className={`flex-1 py-5 rounded-3xl font-bold border-2 transition-all ${preOrder === false ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-50 text-slate-400'}`}>Faqat Joy Band Qilish</button>
                    </div>
                    {preOrder && (
                      <div className="mb-10 animate-in fade-in duration-500">
                        <h4 className="font-bold text-lg mb-6">Menyu</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{products.map(p => (
                          <div key={p.id} className="p-4 bg-slate-50 rounded-2xl flex justify-between items-center group hover:bg-white hover:shadow-sm transition-all">
                            <span className="text-sm font-semibold">{p.name}</span>
                            <button onClick={() => addToCart(p)} className="bg-slate-900 text-white w-8 h-8 rounded-full font-bold active:scale-90">+</button>
                          </div>
                        ))}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <input type="text" placeholder="Ismingiz" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-medium focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            <input type="tel" placeholder="Telefon" className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none font-medium focus:bg-white focus:ring-1 focus:ring-indigo-100 transition-all" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] flex flex-col justify-between">
                            <div className="space-y-2 opacity-60 text-sm">
                                <div className="flex justify-between"><span>Xona bandi:</span><span>{selectedTable.price.toLocaleString()}</span></div>
                                <div className="flex justify-between"><span>Taomlar:</span><span>{cartTotal.toLocaleString()}</span></div>
                            </div>
                            <div className="flex justify-between items-end mt-6 border-t border-slate-800 pt-6">
                                <span className="text-lg opacity-60">Jami:</span>
                                <span className="text-3xl font-bold text-indigo-400">{(selectedTable.price + cartTotal).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => placeOrder('reservation')} disabled={preOrder === null || !customerName || !phone} className="w-full mt-10 py-6 bg-slate-900 text-white rounded-[2.5rem] font-bold text-lg active:scale-95 transition-all">Band Qilishni Tasdiqlash</button>
                  </div>
                )}
              </div>
            )}
            {custTab === 'status' && (
              <div className="max-w-xl mx-auto space-y-8 animate-in fade-in duration-700">
                {orders.length === 0 ? (
                  <div className="text-center py-24 bg-white rounded-[3rem] border border-slate-100">
                    <p className="text-slate-300 font-bold italic">Buyurtmalar mavjud emas</p>
                  </div>
                ) : (
                  orders.map(order => <OrderTracker key={order.id} order={order} />)
                )}
              </div>
            )}
          </div>
        ) : (
          /* Secret Area */
          !isSecretAreaUnlocked ? (
            <AuthBox title="Maxfiy Panel" placeholder="Asosiy kod" onAuth={handleUnlockSecretArea} />
          ) : activeRole === null ? (
            <div className="max-w-4xl mx-auto space-y-12 fade-up">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tizim Boshqaruvi</h2>
                <p className="text-slate-400 font-medium">Davom etish uchun rol tanlang</p>
              </div>

              {pendingRole === null ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { id: 'manager', name: 'Boshliq', icon: '📊', color: 'indigo' },
                    { id: 'admin', name: 'Admin', icon: '⚙️', color: 'slate' },
                    { id: 'courier', name: 'Buyurtmachi', icon: '🚚', color: 'orange' }
                  ].map(role => (
                    <button key={role.id} onClick={() => handleRoleSelect(role.id as SecretRole)} className="bg-white p-12 rounded-[3rem] border border-slate-100 hover:border-indigo-600 hover:scale-[1.02] transition-all flex flex-col items-center group">
                      <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-4xl mb-6 group-hover:bg-indigo-50 transition-colors">{role.icon}</div>
                      <h3 className="text-xl font-bold text-slate-800">{role.name}</h3>
                    </button>
                  ))}
                </div>
              ) : (
                <AuthBox title={`${pendingRole.charAt(0).toUpperCase() + pendingRole.slice(1)} kodi`} placeholder="Kirish kodi" onAuth={handleRoleAuth} onBack={() => setPendingRole(null)} />
              )}
            </div>
          ) : (
            <div className="space-y-10 animate-in fade-in duration-500">
               <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-xl text-white">
                      {activeRole === 'manager' ? '📊' : activeRole === 'admin' ? '⚙️' : '🚚'}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 capitalize">{activeRole} Paneli</h2>
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Sessiya Faol</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveRole(null)} className="px-6 py-3 bg-slate-50 text-slate-500 rounded-xl font-bold text-xs hover:bg-slate-100 transition-all">← Rollarga Qaytish</button>
               </div>
               
               {activeRole === 'manager' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white p-10 rounded-[3rem] border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <div><h3 className="text-xl font-bold">Haftalik Sotuvlar</h3><p className="text-xs text-slate-400 font-medium">So'nggi 7 kun tahlili</p></div>
                            <button onClick={handleGenerateReport} disabled={loadingAi} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold text-sm active:scale-95 transition-all flex items-center gap-2">
                                {loadingAi ? '...' : '✨'} AI Hisoboti
                            </button>
                        </div>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={MOCK_SALES}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 10}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                <Bar dataKey="amount" fill="#4f46e5" radius={[10, 10, 10, 10]} barSize={40} />
                            </BarChart>
                            </ResponsiveContainer>
                        </div>
                        </div>

                        {aiReport && (
                        <div className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-1000">
                            <h4 className="text-xl font-bold mb-6 flex items-center gap-3">✨ AI Hisoboti</h4>
                            <p className="whitespace-pre-wrap leading-relaxed text-slate-300 font-medium text-lg">{aiReport}</p>
                        </div>
                        )}
                    </div>

                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 h-fit">
                        <h3 className="font-bold mb-8 flex items-center gap-2">🛡️ Qurilmalar</h3>
                        <div className="space-y-4">
                            {devices.map(device => (
                                <div key={device.id} className="p-5 bg-slate-50 rounded-3xl flex justify-between items-center group">
                                    <div><p className="text-sm font-bold text-slate-800">{device.name}</p><p className="text-[10px] text-slate-400">{device.location} | {device.ip}</p></div>
                                    <button onClick={() => setDevices(prev => prev.filter(d => d.id !== device.id))} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>
                  </div>
               )}

               {activeRole === 'admin' && (
                 <div className="space-y-10 animate-in fade-in duration-700">
                    <div className="flex bg-white p-1.5 rounded-2xl w-fit border border-slate-100 mx-auto">
                      <button onClick={() => setAdminSection('inventory')} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${adminSection === 'inventory' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>Menu Boshqaruvi</button>
                      <button onClick={() => setAdminSection('rooms')} className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${adminSection === 'rooms' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400'}`}>Xonalar Boshqaruvi</button>
                    </div>
                    {adminSection === 'inventory' ? (
                      <InventoryManager products={products} onToggleStock={toggleStock} onUpdatePrice={updatePrice} onDeleteProduct={deleteProduct} onAddProduct={addProduct} onUpdateImage={updateProductImage} />
                    ) : (
                      <RoomManager rooms={tables} onDeleteRoom={deleteRoom} onAddRoom={addRoom} onUpdatePrice={updateRoomPrice} onUpdateImage={updateRoomImage} />
                    )}
                 </div>
               )}

               {activeRole === 'courier' && (
                 <div className="max-w-4xl mx-auto"><CourierPanel orders={orders} onUpdateStatus={updateOrderStatus} /></div>
               )}
            </div>
          )
        )}
      </main>

      <footer className="bg-white border-t border-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">© 2024 KAMRON Premium Restoran. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
