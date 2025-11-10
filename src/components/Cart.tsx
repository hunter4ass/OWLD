import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { CartItem } from '../types';
import { formatPrice } from '../utils/priceFormatter';
import { ValidationUtils } from '../utils/validation';

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (productId: number) => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  total: number;
  onCheckout: (orderData: any) => void;
  initialCheckoutData?: {
    name?: string;
    phone?: string;
    address?: string;
    paymentMethod?: 'cash' | 'card';
  };
  startInCheckout?: boolean;
}

const Cart: React.FC<CartProps> = ({
  items,
  onClose,
  onRemove,
  onUpdateQuantity,
  total,
  onCheckout,
  initialCheckoutData,
  startInCheckout = false,
}) => {
  const [showCheckout, setShowCheckout] = useState(startInCheckout);
  const [orderData, setOrderData] = useState({
    name: initialCheckoutData?.name ?? '',
    phone: initialCheckoutData?.phone ?? '',
    address: initialCheckoutData?.address ?? '',
    paymentMethod: (initialCheckoutData?.paymentMethod ?? 'cash') as 'cash' | 'card',
  });
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (startInCheckout) {
      setShowCheckout(true);
    }
  }, [startInCheckout]);

  const handleInputChange = (field: string, value: string) => {
    setOrderData(prev => ({ ...prev, [field]: value }));
    
    // Валидируем поле в реальном времени
    let validation: { isValid: boolean; message: string };
    switch (field) {
      case 'name':
        validation = ValidationUtils.validateName(value);
        setErrors(prev => ({ ...prev, name: validation.isValid ? '' : validation.message }));
        break;
      case 'phone':
        validation = ValidationUtils.validatePhone(value);
        setErrors(prev => ({ ...prev, phone: validation.isValid ? '' : validation.message }));
        break;
      case 'address':
        validation = ValidationUtils.validateAddress(value);
        setErrors(prev => ({ ...prev, address: validation.isValid ? '' : validation.message }));
        break;
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Очищаем предыдущие ошибки
    setErrors({ name: '', phone: '', address: '' });

    // Валидируем форму
    const validation = ValidationUtils.validateOrderForm(orderData);
    if (!validation.isValid) {
      // Определяем, какое поле вызвало ошибку
      const nameValidation = ValidationUtils.validateName(orderData.name);
      const phoneValidation = ValidationUtils.validatePhone(orderData.phone);
      const addressValidation = ValidationUtils.validateAddress(orderData.address);

      setErrors({
        name: nameValidation.isValid ? '' : nameValidation.message,
        phone: phoneValidation.isValid ? '' : phoneValidation.message,
        address: addressValidation.isValid ? '' : addressValidation.message,
      });
      setIsSubmitting(false);
      return;
    }

    // Форматируем телефон для сохранения
    const formattedPhone = ValidationUtils.formatPhone(orderData.phone);
    
    onCheckout({
      ...orderData,
      phone: formattedPhone,
    });
    
    setIsSubmitting(false);
  };

  if (showCheckout) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-md border border-gray-700 shadow-2xl">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">Оформление заказа</h2>
            <button
              onClick={() => setShowCheckout(false)}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
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
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Введите ваше имя"
                required
              />
              {errors.name && (
                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                value={orderData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                  errors.phone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="+7 (999) 123-45-67"
                required
              />
              {errors.phone && (
                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Адрес доставки
              </label>
              <textarea
                value={orderData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white h-20 sm:h-24 resize-none text-sm sm:text-base ${
                  errors.address ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ул. Примерная, д. 1, кв. 1"
                required
              />
              {errors.address && (
                <p className="text-red-400 text-xs sm:text-sm mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Способ оплаты
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={orderData.paymentMethod === 'cash'}
                    onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'card' }))}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                  />
                  <span className="text-white text-sm sm:text-base">Наличными курьеру</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={orderData.paymentMethod === 'card'}
                    onChange={(e) => setOrderData(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'card' }))}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                  />
                  <span className="text-white text-sm sm:text-base">Картой онлайн</span>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base sm:text-lg font-medium text-gray-300">Итого:</span>
                <span className="text-xl sm:text-2xl font-bold text-white">{formatPrice(total)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Оформление заказа...</span>
                  </div>
                ) : (
                  'Заказать'
                )}
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
      <div className="w-full max-w-sm sm:max-w-md bg-gray-900 border-l border-gray-700 shadow-2xl overflow-hidden">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                <h2 className="text-lg sm:text-xl font-bold text-white">Корзина</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {items.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <ShoppingBag className="w-12 h-12 sm:w-16 sm:h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-sm sm:text-base">Корзина пуста</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700/50">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded-lg"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm sm:text-base truncate">{item.name}</h3>
                        <p className="text-purple-400 font-bold text-sm sm:text-base">{formatPrice(item.price)}</p>
                      </div>

                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        </button>
                        
                        <span className="text-white font-medium w-6 sm:w-8 text-center text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                        </button>

                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-1 hover:bg-red-500/20 rounded-full transition-colors ml-1 sm:ml-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
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
            <div className="p-4 sm:p-6 border-t border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <span className="text-base sm:text-lg font-medium text-gray-300">Итого:</span>
                <span className="text-xl sm:text-2xl font-bold text-white">{formatPrice(total)}</span>
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