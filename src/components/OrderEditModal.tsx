import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Trash2, Save } from 'lucide-react';
import { Order, Product, CartItem } from '../types';
import { formatPrice } from '../utils/priceFormatter';
import { ValidationUtils } from '../utils/validation';

interface OrderEditModalProps {
  order: Order;
  products: Product[];
  onClose: () => void;
  onSave: (updatedOrder: Order) => void;
}

const OrderEditModal: React.FC<OrderEditModalProps> = ({
  order,
  products,
  onClose,
  onSave,
}) => {
  const [editedOrder, setEditedOrder] = useState<Order>(order);
  const [customerInfo, setCustomerInfo] = useState(order.customerInfo);
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    address: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
    
    // Валидация в реальном времени
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

  const addProduct = (product: Product) => {
    setEditedOrder(prev => {
      const existingItem = prev.items.find(item => item.id === product.id);
      if (existingItem) {
        return {
          ...prev,
          items: prev.items.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
          total: prev.items.reduce((sum, item) => 
            sum + (item.id === product.id ? product.price * (item.quantity + 1) : item.price * item.quantity), 0
          )
        };
      } else {
        const newItem: CartItem = { ...product, quantity: 1 };
        return {
          ...prev,
          items: [...prev.items, newItem],
          total: prev.total + product.price
        };
      }
    });
  };

  const removeProduct = (productId: number) => {
    setEditedOrder(prev => {
      const itemToRemove = prev.items.find(item => item.id === productId);
      if (!itemToRemove) return prev;

      return {
        ...prev,
        items: prev.items.filter(item => item.id !== productId),
        total: prev.total - (itemToRemove.price * itemToRemove.quantity)
      };
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeProduct(productId);
      return;
    }

    setEditedOrder(prev => {
      const item = prev.items.find(item => item.id === productId);
      if (!item) return prev;

      const quantityDiff = quantity - item.quantity;
      return {
        ...prev,
        items: prev.items.map(item =>
          item.id === productId ? { ...item, quantity } : item
        ),
        total: prev.total + (item.price * quantityDiff)
      };
    });
  };

  const handleSave = () => {
    // Валидируем форму
    const validation = ValidationUtils.validateOrderForm(customerInfo);
    if (!validation.isValid) {
      const nameValidation = ValidationUtils.validateName(customerInfo.name);
      const phoneValidation = ValidationUtils.validatePhone(customerInfo.phone);
      const addressValidation = ValidationUtils.validateAddress(customerInfo.address);

      setErrors({
        name: nameValidation.isValid ? '' : nameValidation.message,
        phone: phoneValidation.isValid ? '' : phoneValidation.message,
        address: addressValidation.isValid ? '' : addressValidation.message,
      });
      return;
    }

    // Форматируем телефон
    const formattedPhone = ValidationUtils.formatPhone(customerInfo.phone);
    
    const updatedOrder: Order = {
      ...editedOrder,
      customerInfo: {
        ...customerInfo,
        phone: formattedPhone,
      },
      total: editedOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    onSave(updatedOrder);
  };

  const isFormValid = () => {
    return (
      customerInfo.name.trim() !== '' &&
      customerInfo.phone.trim() !== '' &&
      customerInfo.address.trim() !== '' &&
      !errors.name &&
      !errors.phone &&
      !errors.address &&
      editedOrder.items.length > 0
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-4xl max-h-[90vh] overflow-hidden border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Редактирование заказа #{order.id}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto max-h-[70vh]">
          {/* Customer Info */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Данные доставки</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Имя
              </label>
              <input
                type="text"
                value={customerInfo.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="Введите ваше имя"
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
                value={customerInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-sm sm:text-base ${
                  errors.phone ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="+7 (999) 123-45-67"
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
                value={customerInfo.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className={`w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white h-20 sm:h-24 resize-none text-sm sm:text-base ${
                  errors.address ? 'border-red-500' : 'border-gray-600'
                }`}
                placeholder="ул. Примерная, д. 1, кв. 1"
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
                    checked={customerInfo.paymentMethod === 'cash'}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'card' }))}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                  />
                  <span className="text-white text-sm sm:text-base">Наличными курьеру</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={customerInfo.paymentMethod === 'card'}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, paymentMethod: e.target.value as 'cash' | 'card' }))}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 focus:ring-purple-500"
                  />
                  <span className="text-white text-sm sm:text-base">Картой онлайн</span>
                </label>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Товары в заказе</h3>
            
            {/* Current Items */}
            <div className="space-y-2 sm:space-y-3">
              {editedOrder.items.map((item) => (
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
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </button>
                      
                      <span className="text-white font-medium w-6 sm:w-8 text-center text-sm sm:text-base">
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                      </button>

                      <button
                        onClick={() => removeProduct(item.id)}
                        className="p-1 hover:bg-red-500/20 rounded-full transition-colors ml-1 sm:ml-2"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Products */}
            <div>
              <h4 className="text-sm sm:text-md font-semibold text-white mb-2 sm:mb-3">Добавить товары</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 sm:max-h-40 overflow-y-auto">
                {products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => addProduct(product)}
                    className="flex items-center space-x-2 p-2 bg-gray-800/50 rounded-lg hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-6 h-6 sm:w-8 sm:h-8 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs sm:text-sm truncate">{product.name}</p>
                      <p className="text-purple-400 text-xs">{formatPrice(product.price)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-700 pt-3 sm:pt-4">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg font-medium text-gray-300">Итого:</span>
                <span className="text-xl sm:text-2xl font-bold text-white">{formatPrice(editedOrder.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm sm:text-base"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
          >
            <Save className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Сохранить изменения</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderEditModal; 