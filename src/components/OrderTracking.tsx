import React, { useEffect, useState } from 'react';
import { X, Clock, MapPin, Package, CheckCircle } from 'lucide-react';
import { Order } from '../types';
import { OrderStatusManager } from '../utils/orderStatusManager';
import { formatPrice } from '../utils/priceFormatter';

interface OrderTrackingProps {
  order: Order;
  onClose: () => void;
  onStatusChange: (order: Order) => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onClose, onStatusChange }) => {
  const [currentOrder, setCurrentOrder] = useState<Order>(order);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    setCurrentOrder(order);
    
    // Запускаем прогрессию статуса
    OrderStatusManager.startStatusProgression(order, (updatedOrder) => {
      setCurrentOrder(updatedOrder);
      onStatusChange(updatedOrder);
    });

    // Обновляем время каждую секунду
    const timeInterval = setInterval(() => {
      setTimeLeft(OrderStatusManager.getEstimatedTime(order));
    }, 1000);

    return () => {
      OrderStatusManager.stopProgression(order.id);
      clearInterval(timeInterval);
    };
  }, [order, onStatusChange]);

  const statusInfo = OrderStatusManager.getStatusInfo(currentOrder.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl sm:rounded-2xl p-6 sm:p-8 w-full max-w-sm sm:max-w-2xl border border-gray-700 shadow-2xl">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Отслеживание заказа</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
          </button>
        </div>

        {/* Order Info */}
        <div className="bg-gray-800/50 rounded-lg sm:rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Информация о заказе</h3>
              <p className="text-gray-400 text-sm sm:text-base">Заказ #{currentOrder.id}</p>
              <p className="text-gray-400 text-sm sm:text-base">Сумма: {formatPrice(currentOrder.total)}</p>
          </div>
          <div>
              <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Доставка</h3>
              <p className="text-gray-400 text-sm sm:text-base">{currentOrder.customerInfo.name}</p>
              <p className="text-gray-400 text-sm sm:text-base">{currentOrder.customerInfo.phone}</p>
              <p className="text-gray-400 text-sm sm:text-base">{currentOrder.customerInfo.address}</p>
              <p className="text-gray-400 text-sm sm:text-base">
                Способ оплаты: {currentOrder.customerInfo.paymentMethod === 'cash' ? 'Наличными' : 'Картой онлайн'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Progress */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Статус заказа</h3>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
              <span className="text-purple-400 font-medium text-sm sm:text-base">{timeLeft}</span>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              {['pending', 'preparing', 'collecting', 'delivering', 'delivered'].map((status, index) => {
                const isActive = status === currentOrder.status;
                const isCompleted = ['pending', 'preparing', 'collecting', 'delivering', 'delivered'].indexOf(currentOrder.status) >= index;

              return (
                  <div key={status} className="flex flex-col items-center">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-purple-500' : 'bg-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      ) : (
                        <span className="text-white text-xs sm:text-sm">{index + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs mt-1 sm:mt-2 text-center ${isActive ? 'text-purple-400 font-medium' : 'text-gray-400'}`}>
                      {OrderStatusManager.getStatusInfo(status as Order['status']).title}
                    </span>
                </div>
              );
            })}
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-orange-500 transition-all duration-1000 ease-out"
                style={{ width: `${statusInfo.progress}%` }}
              ></div>
            </div>
          </div>

          <div className="text-center mt-3 sm:mt-4">
            <h4 className={`text-base sm:text-lg font-semibold ${statusInfo.color}`}>
              {statusInfo.title}
            </h4>
            <p className="text-gray-400 text-sm sm:text-base">{statusInfo.description}</p>
          </div>
        </div>

        {/* Order Items */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Товары в заказе</h3>
          <div className="space-y-2 sm:space-y-3">
            {currentOrder.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-gray-800/50 rounded-lg p-2 sm:p-3">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-8 h-8 sm:w-12 sm:h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="text-white font-medium text-sm sm:text-base">{item.name}</p>
                    <p className="text-gray-400 text-xs sm:text-sm">Количество: {item.quantity}</p>
                  </div>
                </div>
                <p className="text-purple-400 font-bold text-sm sm:text-base">
                  {formatPrice(item.price * item.quantity)}
            </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
