
export enum StockStatus {
  IN_STOCK = 'Bor',
  OUT_OF_STOCK = 'Tugagan'
}

export enum OrderStatus {
  PENDING = 'Kutilmoqda',
  ACCEPTED = 'Buyurtma qabul qilindi, tayyorlanmoqda',
  DELIVERING = 'Buyurtma yo\'lda, yetkazib berilmoqda',
  COMPLETED = 'Yakunlandi'
}

export type OrderType = 'delivery' | 'reservation';

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  status: StockStatus;
}

export interface TableRoom {
  id: string;
  name: string;
  capacity: number;
  price: number;
  image: string;
  isAvailable: boolean;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  type: OrderType;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  customerName: string;
  phone: string;
  address?: string;
  tableId?: string;
  createdAt: Date;
}

export interface SaleData {
  date: string;
  amount: number;
  orders: number;
}
