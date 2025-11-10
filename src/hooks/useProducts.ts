import { useState, useEffect } from 'react';
import { Product } from '../types';
import { ApiService } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем продукты и категории параллельно
        const [productsData, categoriesData] = await Promise.all([
          ApiService.getAllProducts(),
          ApiService.getCategories()
        ]);
        
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке данных');
        console.error('Error in useProducts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProductsByCategory = async (category: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getProductsByCategory(category);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при загрузке категории');
      console.error('Error in getProductsByCategory:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getAllProducts();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при обновлении данных');
      console.error('Error in refreshProducts:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    categories,
    loading,
    error,
    getProductsByCategory,
    refreshProducts,
  };
}; 