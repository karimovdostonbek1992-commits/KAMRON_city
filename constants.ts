
import { StockStatus, Product, TableRoom, SaleData } from './types';

export const CATEGORIES = ['Asosiy Taomlar', 'Ichimliklar', 'Shirinliklar', 'Salatlar'];

export const MOCK_PRODUCTS: Product[] = [
  { id: '1', name: 'Palov (Osh)', price: 45000, category: 'Asosiy Taomlar', image: 'https://picsum.photos/seed/osh/400/300', status: StockStatus.IN_STOCK },
  { id: '2', name: 'Shashlik (Mol go\'shti)', price: 15000, category: 'Asosiy Taomlar', image: 'https://picsum.photos/seed/shashlik/400/300', status: StockStatus.IN_STOCK },
  { id: '3', name: 'Somsa', price: 8000, category: 'Asosiy Taomlar', image: 'https://picsum.photos/seed/somsa/400/300', status: StockStatus.OUT_OF_STOCK },
  { id: '4', name: 'Achchiq-chuchuq', price: 12000, category: 'Salatlar', image: 'https://picsum.photos/seed/salad/400/300', status: StockStatus.IN_STOCK },
  { id: '5', name: 'Koka-Kola 1.5L', price: 14000, category: 'Ichimliklar', image: 'https://picsum.photos/seed/cola/400/300', status: StockStatus.IN_STOCK },
  { id: '6', name: 'Choy (Ko\'k/Qora)', price: 5000, category: 'Ichimliklar', image: 'https://picsum.photos/seed/tea/400/300', status: StockStatus.IN_STOCK },
];

export const MOCK_TABLES: TableRoom[] = [
  { id: 't1', name: 'VIP Xona 1', capacity: 8, price: 100000, image: 'https://picsum.photos/seed/vip1/400/300', isAvailable: true },
  { id: 't2', name: 'VIP Xona 2', capacity: 12, price: 150000, image: 'https://picsum.photos/seed/vip2/400/300', isAvailable: true },
  { id: 't3', name: 'Oila xonasi', capacity: 6, price: 50000, image: 'https://picsum.photos/seed/family/400/300', isAvailable: true },
  { id: 't4', name: 'Ochiq stol #5', capacity: 4, price: 0, image: 'https://picsum.photos/seed/table5/400/300', isAvailable: true },
];

export const MOCK_SALES: SaleData[] = [
  { date: '2024-05-13', amount: 2500000, orders: 45 },
  { date: '2024-05-14', amount: 1800000, orders: 32 },
  { date: '2024-05-15', amount: 3200000, orders: 58 },
  { date: '2024-05-16', amount: 2100000, orders: 38 },
  { date: '2024-05-17', amount: 4500000, orders: 82 },
  { date: '2024-05-18', amount: 5200000, orders: 95 },
  { date: '2024-05-19', amount: 4800000, orders: 88 },
];
