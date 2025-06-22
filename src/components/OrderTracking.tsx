import React, { useState, useEffect } from 'react';
import { X, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingProps {
  order: Order;
  onClose: () => void;
}

const OrderTracking: React.FC<OrderTrackingProps> = ({ order, onClose }) => {
  const [currentStatus, setCurrentStatus] = useState<Order['status']>(order.status);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes in seconds

  const statusConfig = {
    preparing: {
      icon: Clock,
      title: 'Заказ оформлен',
      description: 'Ваш заказ принят и передан в обработку',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    collecting: {
      icon: Package,
      title: 'Заказ в сборке',
      description: 'Собираем ваш заказ на складе',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
    delivering: {
      icon: Truck,
      title: 'В пути',
      description: 'Курьер направляется к вам',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    delivered: {
      icon: CheckCircle,
      title: 'Доставлено',
      description: 'Заказ успешно доставлен',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
  };

  useEffect(() => {
    const statusSequence: Order['status'][] = ['preparing', 'collecting', 'delivering', 'delivered'];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < statusSequence.length - 1) {
        currentIndex++;
        setCurrentStatus(statusSequence[currentIndex]);
      } else {
        clearInterval(interval);
      }
    }, 120000); // 2 minutes

    // Timer countdown
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          return 120; // Reset to 2 minutes
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentStepIndex = () => {
    const statusOrder = ['preparing', 'collecting', 'delivering', 'delivered'];
    return statusOrder.indexOf(currentStatus);
  };

  const config = statusConfig[currentStatus];
  const IconComponent = config.icon;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm">
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 shadow-2xl backdrop-blur-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Отслеживание заказа</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Order Info */}
        <div className="mb-4 p-3 bg-gray-800/50 rounded-lg">
          <p className="text-sm text-gray-400">Заказ #{order.id}</p>
          <p className="text-white font-medium">{order.total} ₽</p>
        </div>

        {/* Current Status */}
        <div className={`flex items-center space-x-3 p-4 ${config.bgColor} rounded-xl mb-4`}>
          <div className={`p-2 bg-gray-900 rounded-full ${config.color}`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <h4 className={`font-bold ${config.color}`}>{config.title}</h4>
            <p className="text-sm text-gray-300">{config.description}</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            {Object.entries(statusConfig).map(([status, config], index) => {
              const isActive = index <= getCurrentStepIndex();
              const isCompleted = index < getCurrentStepIndex();
              const StepIcon = config.icon;

              return (
                <div key={status} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? config.bgColor : 'bg-gray-700'
                  }`}>
                    <StepIcon className={`w-4 h-4 ${
                      isActive ? config.color : 'text-gray-500'
                    }`} />
                  </div>
                  {index < 3 && (
                    <div className={`h-1 w-full ${
                      isCompleted ? 'bg-purple-500' : 'bg-gray-700'
                    } mt-2`}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Next Update Timer */}
        {currentStatus !== 'delivered' && (
          <div className="text-center">
            <p className="text-sm text-gray-400">Следующее обновление через:</p>
            <p className="text-lg font-bold text-purple-400">{formatTime(timeLeft)}</p>
          </div>
        )}

        {/* Delivery Address */}
        <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
          <p className="text-sm text-gray-400">Адрес доставки:</p>
          <p className="text-white text-sm">{order.deliveryAddress}</p>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;