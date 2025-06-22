export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  inStock: boolean;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'preparing' | 'collecting' | 'delivering' | 'delivered';
  createdAt: Date;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
}