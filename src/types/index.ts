export interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
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

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  paymentMethod: 'cash' | 'card';
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "preparing" | "collecting" | "delivering" | "delivered";
  createdAt: string;
  estimatedDelivery: string;
  customerInfo: CustomerInfo;
}
