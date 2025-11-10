import { User, CartItem, Order } from '../types';

export class StorageUtils {
  private static USER_KEY = 'owl_user';
  private static CART_KEY = 'owl_cart';
  private static ORDERS_KEY = 'owl_orders';

  // User
  static saveUser(user: User): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  static removeUser(): void {
    localStorage.removeItem(this.USER_KEY);
  }

  // Cart
  static saveCart(cart: CartItem[]): void {
    localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
  }

  static getCart(): CartItem[] {
    const cartData = localStorage.getItem(this.CART_KEY);
    return cartData ? JSON.parse(cartData) : [];
  }

  static clearCart(): void {
    localStorage.removeItem(this.CART_KEY);
  }

  // Orders
  static saveOrders(orders: Order[]): void {
    localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
  }

  static getOrders(): Order[] {
    const ordersData = localStorage.getItem(this.ORDERS_KEY);
    return ordersData ? JSON.parse(ordersData) : [];
  }

  static addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
  }

  static updateOrder(updatedOrder: Order): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === updatedOrder.id);
    if (index !== -1) {
      orders[index] = updatedOrder;
      this.saveOrders(orders);
    }
  }

  // Clear all data
  static clearAll(): void {
    localStorage.removeItem(this.USER_KEY);
    localStorage.removeItem(this.CART_KEY);
    localStorage.removeItem(this.ORDERS_KEY);
  }
} 