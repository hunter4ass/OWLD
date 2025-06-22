import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem } from '../types';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  total: number;
  onCheckout: (orderData: any) => void;
}

const Cart: React.FC<CartProps> = ({
  items,
  onClose,
  onRemove,
  onUpdateQuantity,
  total,
  onCheckout,
}) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderData, setOrderData] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    onCheckout(orderData);
  };

  if (showCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-2xl p-8 w-full max-w-md border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Оформление заказа</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя
              </label>
              <input
                type="text"
                value={orderData.name}
                onChange={(e) => setOrderData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={orderData.phone}
                onChange={(e) => setOrderData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Адрес доставки
              </label>
              <textarea
                value={orderData.address}
                onChange={(e) => setOrderData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white h-24 resize-none"
                required
              />
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-300">Итого:</span>
                <span className="text-2xl font-bold text-white">{total} ₽</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Заказать
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Cart Panel */}
      <div className="w-full max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-6 h-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">Корзина</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Корзина пуста</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                    <div className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white">{item.name}</h3>
                        <p className="text-purple-400 font-bold">{item.price} ₽</p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <Minus className="w-4 h-4 text-gray-400" />
                        </button>
                        
                        <span className="text-white font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>

                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-1 hover:bg-red-500/20 rounded-full transition-colors ml-2"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className="p-6 border-t border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-300">Итого:</span>
                <span className="text-2xl font-bold text-white">{total} ₽</span>
              </div>
              
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
              >
                Оформить заказ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;