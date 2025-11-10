import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Moon, Search, MapPin, Clock, Package, RefreshCw, Phone, Mail } from 'lucide-react';
import AuthModal from './components/AuthModal';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import OrderTracking from './components/OrderTracking';
import UserProfile from './components/UserProfile';
import LoadingSpinner from './components/LoadingSpinner';
import OrderEditModal from './components/OrderEditModal';
import { Product, CartItem, User as UserType, Order } from './types';
import { useProducts } from './hooks/useProducts';
import { OrderStatusManager } from './utils/orderStatusManager';
import { UserService } from './services/userService';
import { StorageUtils } from './utils/storage';

function App() {
  const [user, setUser] = useState<UserType | null>(StorageUtils.getUser());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cart, setCart] = useState<CartItem[]>(StorageUtils.getCart());
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>(StorageUtils.getOrders());
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [checkoutPrefill, setCheckoutPrefill] = useState<{name?: string; phone?: string; address?: string; paymentMethod?: 'cash' | 'card'} | undefined>(undefined);
  const [startCheckoutNow, setStartCheckoutNow] = useState(false);

  const { products, categories, loading, error, getProductsByCategory, refreshProducts } = useProducts();

  // Очищаем все интервалы при размонтировании компонента
  useEffect(() => {
    return () => {
      OrderStatusManager.stopAllProgressions();
    };
  }, []);

  // Запускаем прогрессию статусов для всех активных заказов, независимо от просмотра
  useEffect(() => {
    const activeOrders = orderHistory.filter(o => o.status !== 'delivered');
    activeOrders.forEach((ord) => {
      OrderStatusManager.startStatusProgression(ord, (updated) => {
        setOrderHistory(prev =>
          prev.map(o => o.id === updated.id ? updated : o)
        );
        StorageUtils.updateOrder(updated);
        setCurrentOrder(prev => (prev && prev.id === updated.id ? updated : prev));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderHistory.length]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    if (category === 'all') {
      refreshProducts();
    } else {
      getProductsByCategory(category);
    }
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        const newCart = prevCart.map(item =>
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        StorageUtils.saveCart(newCart);
        return newCart;
      } else {
        const newCart = [...prevCart, { ...product, quantity: 1 }];
        StorageUtils.saveCart(newCart);
        return newCart;
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      StorageUtils.saveCart(newCart);
      return newCart;
    });
  };

  const updateCartItemQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => {
      const newCart = prevCart.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
      StorageUtils.saveCart(newCart);
      return newCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    StorageUtils.clearCart();
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleAuthSuccess = async (userData: UserType) => {
    setUser(userData);
    StorageUtils.saveUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setOrderHistory([]);
    StorageUtils.clearAll();
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setShowUserProfile(false);
  };

  const handleSaveOrderEdit = (updatedOrder: Order) => {
    setOrderHistory(prev => 
      prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
    );
    StorageUtils.updateOrder(updatedOrder);
    setEditingOrder(null);
  };

  const handleReorder = (order: Order) => {
    // Восстанавливаем товары в корзину
    setCart(order.items);
    StorageUtils.saveCart(order.items);
    // Предзаполняем форму заказа
    setCheckoutPrefill({
      name: order.customerInfo.name,
      phone: order.customerInfo.phone,
      address: order.customerInfo.address,
      paymentMethod: order.customerInfo.paymentMethod,
    });
    setStartCheckoutNow(true);
    setShowCart(true);
  };

  const handleCheckout = async (orderData: any) => {
    if (!user) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      userId: user.id,
      items: cart,
      total: getTotalPrice(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      customerInfo: {
        name: orderData.name,
        phone: orderData.phone,
        address: orderData.address,
        paymentMethod: orderData.paymentMethod,
      },
      estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 минут
    };

    setOrderHistory(prev => [newOrder, ...prev]);
    StorageUtils.addOrder(newOrder);
    setCart([]);
    StorageUtils.clearCart();
    setShowCart(false);
    setCurrentOrder(newOrder);
    setCheckoutPrefill(undefined);
    setStartCheckoutNow(false);

    // Запускаем прогрессию статуса сразу
    OrderStatusManager.startStatusProgression(newOrder, (updated) => {
      setOrderHistory(prev =>
        prev.map(o => o.id === updated.id ? updated : o)
      );
      StorageUtils.updateOrder(updated);
      setCurrentOrder(prev => (prev && prev.id === updated.id ? updated : prev));
    });
  };

  const handleTrackOrder = (order: Order) => {
    setCurrentOrder(order);
    setShowUserProfile(false);
  };

  const handleUserClick = () => {
    if (user) {
      setShowUserProfile(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-orange-900">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-purple-500/20 sticky top-0 z-40">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between py-3 sm:py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full flex items-center justify-center">
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                  OWLDelivery
                </h1>
                <p className="text-xs text-gray-400">Ночная доставка товаров</p>
              </div>
            </div>

            {/* Search Bar - скрываем на мобильных */}
            <div className="hidden sm:flex flex-1 max-w-md mx-4">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="relative p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </button>

              {/* User Button */}
              {user ? (
                <button
                  onClick={() => setShowUserProfile(true)}
                  className="p-2 sm:p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-lg transition-all transform hover:scale-105"
                >
                  <span className="hidden sm:inline">Войти</span>
                  <User className="w-5 h-5 sm:hidden" />
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="sm:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск товаров..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-800 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-400 text-sm"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 sm:py-16 px-2 sm:px-4 overflow-hidden">
        <div className="container mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white mb-4 sm:mb-6">
            Ночная доставка
            <span className="block bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
              товаров
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 mb-3 sm:mb-4 max-w-2xl mx-auto">
            Доставляем товары с 22:00 до 10:00.
          </p>
          <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Быстро, удобно, качественно.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 lg:space-x-8 text-gray-300">
              <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              <span className="text-sm sm:text-base">с 22:00 до 10:00</span>
              </div>
              <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
              <span className="text-sm sm:text-base">По всему городу</span>
              </div>
              <div className="flex items-center space-x-2">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              <span className="text-sm sm:text-base">доставка от 30 минут</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 sm:py-8 px-2 sm:px-4">
        <div className="container mx-auto">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Все
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base font-medium transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

      {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
                isInCart={cart.some(item => item.id === product.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onLogin={handleAuthSuccess}
          onModeChange={setAuthMode}
        />
      )}

      {showCart && (
        <Cart
          items={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartItemQuantity}
          total={getTotalPrice()}
          onCheckout={handleCheckout}
          initialCheckoutData={checkoutPrefill}
          startInCheckout={startCheckoutNow}
        />
      )}

      {showUserProfile && user && (
        <UserProfile
          user={user}
          orderHistory={orderHistory}
          currentOrder={currentOrder}
          onClose={() => setShowUserProfile(false)}
          onTrackOrder={handleTrackOrder}
          onLogout={handleLogout}
          onEditOrder={handleEditOrder}
          onReorder={handleReorder}
          onUserUpdated={(u) => {
            setUser(u);
            StorageUtils.saveUser(u);
          }}
        />
      )}

      {currentOrder && (
        <OrderTracking
          order={currentOrder}
          onClose={() => setCurrentOrder(null)}
          onStatusChange={(updatedOrder) => {
            setCurrentOrder(updatedOrder);
            setOrderHistory(prev => 
              prev.map(o => o.id === updatedOrder.id ? updatedOrder : o)
            );
          }}
        />
      )}

      {editingOrder && (
        <OrderEditModal
          order={editingOrder}
          products={products}
          onClose={() => setEditingOrder(null)}
          onSave={handleSaveOrderEdit}
        />
      )}

      {/* Footer */}
      <footer className="bg-gray-900/80 border-t border-purple-500/20 mt-12 sm:mt-20">
        <div className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Company Info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                  OWLDelivery
                </h3>
              </div>
              <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
                Ночная доставка товаров с 22:00 до 10:00
              </p>
              <div className="flex items-center space-x-2 text-gray-400">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-sm sm:text-base">Время работы: с 22:00 до 10:00</span>
              </div>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Контакты</h4>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center space-x-2 text-gray-400">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">+7 (495) 123-45-67</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">info@owldelivery.ru</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">г. Москва, ул. Ночная, д. 1</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4">Информация</h4>
              <div className="space-y-1 sm:space-y-2">
                <p className="text-sm sm:text-base text-gray-400">Доставка от 30 минут</p>
                <p className="text-sm sm:text-base text-gray-400">Минимальная сумма: 500 ₽</p>
                <p className="text-sm sm:text-base text-gray-400">Бесплатная доставка от 2000 ₽</p>
                <p className="text-sm sm:text-base text-gray-400">Оплата наличными или картой</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
            <p className="text-sm sm:text-base text-gray-400">
              © 2024 OWLDelivery. Все права защищены.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;