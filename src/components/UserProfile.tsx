import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Package, Clock, Eye, History, LogOut } from 'lucide-react';
import { User as UserType, Order } from '../types';

interface UserProfileProps {
  user: UserType;
  orderHistory: Order[];
  currentOrder: Order | null;
  onClose: () => void;
  onTrackOrder: (order: Order) => void;
  onLogout: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  orderHistory,
  currentOrder,
  onClose,
  onTrackOrder,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'current'>('profile');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'preparing':
        return 'text-blue-400 bg-blue-500/20';
      case 'collecting':
        return 'text-yellow-400 bg-yellow-500/20';
      case 'delivering':
        return 'text-purple-400 bg-purple-500/20';
      case 'delivered':
        return 'text-green-400 bg-green-500/20';
      default:
        return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'preparing':
        return 'Оформлен';
      case 'collecting':
        return 'В сборке';
      case 'delivering':
        return 'Доставка';
      case 'delivered':
        return 'Доставлен';
      default:
        return 'Неизвестно';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] border border-gray-700 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Личный кабинет</h2>
              <p className="text-gray-400">{user.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'profile'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <User className="w-5 h-5 inline mr-2" />
            Профиль
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <History className="w-5 h-5 inline mr-2" />
            История заказов
          </button>
          {currentOrder && (
            <button
              onClick={() => setActiveTab('current')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'current'
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-800/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Package className="w-5 h-5 inline mr-2" />
              Текущий заказ
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Личная информация</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Имя</p>
                        <p className="text-white font-medium">{user.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-400">Email</p>
                        <p className="text-white font-medium">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">Статистика</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Всего заказов</span>
                      <span className="text-white font-bold">{orderHistory.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Потрачено</span>
                      <span className="text-white font-bold">
                        {orderHistory.reduce((total, order) => total + order.total, 0)} ₽
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Статус</span>
                      <span className="text-green-400 font-medium">Активный</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orderHistory.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">У вас пока нет заказов</p>
                </div>
              ) : (
                orderHistory.map((order) => (
                  <div
                    key={order.id}
                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Заказ #{order.id}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                        <span className="text-white font-bold text-lg">
                          {order.total} ₽
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{order.deliveryAddress}</span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Детали</span>
                        </button>
                        {order.status !== 'delivered' && (
                          <button
                            onClick={() => onTrackOrder(order)}
                            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white rounded-lg transition-colors"
                          >
                            <Package className="w-4 h-4" />
                            <span>Отследить</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'current' && currentOrder && (
            <div className="space-y-6">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">
                    Текущий заказ #{currentOrder.id}
                  </h3>
                  <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(currentOrder.status)}`}>
                    {getStatusText(currentOrder.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Информация о доставке</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{currentOrder.customerName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{currentOrder.customerPhone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{currentOrder.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-purple-400" />
                        <span className="text-gray-300">{formatDate(currentOrder.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-medium text-white mb-3">Итого</h4>
                    <div className="text-3xl font-bold text-white">
                      {currentOrder.total} ₽
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onTrackOrder(currentOrder)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-lg transition-colors"
                >
                  Отследить заказ
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[80vh] border border-gray-700 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h3 className="text-xl font-bold text-white">
                  Детали заказа #{selectedOrder.id}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-700 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formatDate(selectedOrder.createdAt)}
                    </span>
                  </div>

                  <h4 className="text-lg font-semibold text-white mb-3">Товары в заказе</h4>
                  
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-800/50 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-white">{item.name}</h5>
                        <p className="text-gray-400 text-sm">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{item.quantity} шт.</p>
                        <p className="text-purple-400 font-bold">{item.price * item.quantity} ₽</p>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-300">Итого:</span>
                      <span className="text-2xl font-bold text-white">{selectedOrder.total} ₽</span>
                    </div>
                  </div>

                  <div className="bg-gray-800/30 rounded-lg p-4">
                    <h5 className="font-medium text-white mb-2">Адрес доставки</h5>
                    <p className="text-gray-300">{selectedOrder.deliveryAddress}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;