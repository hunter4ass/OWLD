import React, { useState } from 'react';
import { Plus, ShoppingCart } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);
    setTimeout(() => {
      onAddToCart(product);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group">
      {/* Product Image */}
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-400 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            {product.price} ₽
          </div>
          
          <button
            onClick={handleAddToCart}
            disabled={isLoading || !product.inStock}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">В корзину</span>
              </>
            )}
          </button>
        </div>

        {!product.inStock && (
          <div className="text-center py-2">
            <span className="text-red-400 text-sm font-medium">Нет в наличии</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;