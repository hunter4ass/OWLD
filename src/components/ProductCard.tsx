import React, { useState } from "react";
import { Plus, ShoppingCart, CheckCircle } from "lucide-react";
import { Product } from "../types";
import { formatPrice } from "../utils/priceFormatter";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isInCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isInCart = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = () => {
    setIsLoading(true);
    setTimeout(() => {
      onAddToCart(product);
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl group flex flex-col h-full">
      {/* Product Image */}
      <div className="relative mb-3 sm:mb-4 overflow-hidden rounded-lg sm:rounded-xl">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (target.src.includes('via.placeholder.com')) return;
            target.src = 'https://via.placeholder.com/400x400?text=No+Image';
          }}
          className="w-full h-32 sm:h-48 object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="flex flex-col flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-purple-300 transition-colors mb-2">
          {product.name}
        </h3>

        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 mb-3 sm:mb-4 flex-1">
          {product.description}
        </p>

        {/* Price and Button - выровнены по нижнему краю */}
        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg sm:text-2xl font-bold text-white">
            {formatPrice(product.price)}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isLoading || !product.inStock || isInCart}
            className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 font-medium rounded-full transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isInCart 
                ? 'bg-green-600 text-white cursor-default' 
                : 'bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : isInCart ? (
              <>
                <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-sm">В корзине</span>
                <span className="sm:hidden text-xs">✓</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline text-sm">В корзину</span>
                <span className="sm:hidden text-xs">+</span>
              </>
            )}
          </button>
        </div>

        {!product.inStock && (
          <div className="text-center py-2 mt-2">
            <span className="text-red-400 text-xs sm:text-sm font-medium">
              Нет в наличии
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
