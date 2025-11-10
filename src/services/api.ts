import { Product } from '../types';
import { products as localProducts } from '../data/products';

const API_BASE_URL = 'https://fakestoreapi.com';
const USE_LOCAL_FALLBACK = true; // включаем безопасный фолбэк при проблемах сети

export interface FakeStoreProduct {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
}

export class ApiService {
  private static async fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit, timeoutMs = 6000): Promise<Response> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(id);
    }
  }

  private static toAppProduct(api: FakeStoreProduct): Product {
    return {
      id: api.id, // число
      name: api.title,
      price: Math.round(api.price * 80),
      image: api.image,
      category: api.category,
      description: api.description,
      inStock: true,
    };
  }

  private static localNormalized(): Product[] {
    // нормализуем id из локальных данных к числам
    return localProducts.map(p => ({
      ...p,
      id: Number(p.id),
    }));
  }

  static async getAllProducts(): Promise<Product[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products`, undefined, 20000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FakeStoreProduct[] = await response.json();
      
      // Преобразуем данные Fake Store API в наш формат
      return data.map(this.toAppProduct);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Фолбэк на локальные данные при AbortError/сетевых проблемах
      // или когда явно включен фолбэк
      // @ts-expect-error – у ошибок из fetch может не быть name
      const isAbort = error?.name === 'AbortError';
      if (USE_LOCAL_FALLBACK || isAbort) {
        return this.localNormalized();
      }
      throw error;
    }
  }

  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/category/${category}`, undefined, 20000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: FakeStoreProduct[] = await response.json();
      
      return data.map(this.toAppProduct);
    } catch (error) {
      console.error('Error fetching products by category:', error);
      // @ts-expect-error – у ошибок из fetch может не быть name
      const isAbort = error?.name === 'AbortError';
      if (USE_LOCAL_FALLBACK || isAbort) {
        return this.localNormalized().filter(p => p.category === category);
      }
      throw error;
    }
  }

  static async getCategories(): Promise<string[]> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/categories`, undefined, 20000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      // @ts-expect-error – у ошибок из fetch может не быть name
      const isAbort = error?.name === 'AbortError';
      if (USE_LOCAL_FALLBACK || isAbort) {
        const unique = Array.from(new Set(this.localNormalized().map(p => p.category)));
        return unique;
      }
      throw error;
    }
  }

  static async getProduct(id: string): Promise<Product> {
    try {
      const response = await this.fetchWithTimeout(`${API_BASE_URL}/products/${id}`, undefined, 10000);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const product: FakeStoreProduct = await response.json();
      
      return this.toAppProduct(product);
    } catch (error) {
      console.error('Error fetching product:', error);
      if (USE_LOCAL_FALLBACK) {
        // Фолбэк: ищем товар в локальных данных
        const p = this.localNormalized().find(p => p.id === Number(id));
        if (!p) {
          throw error;
        }
        return p;
      }
      throw error;
    }
  }
} 