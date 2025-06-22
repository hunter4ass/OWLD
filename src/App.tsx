import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Moon, Search, MapPin, Clock, Package } from 'lucide-react';
import AuthModal from './components/AuthModal';
import ProductCard from './components/ProductCard';
import Cart from './components/Cart';
import OrderTracking from './components/OrderTracking';
import UserProfile from './components/UserProfile';
import { Product, CartItem, User as UserType, Order } from './types';
import { products } from './data/products';

function App() {
  const [user, setUser] = useState<UserType | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [showUserProfile, setShowUserProfile] = useState(false);

  const categories = ['all', 'fruits', 'vegetables', 'dairy', 'snacks', 'beverages'];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => 
      prev.map(item => 
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = (orderData: any) => {
    const order: Order = {
      id: Date.now().toString(),
      items: cart,
      total: getTotalPrice(),
      status: 'preparing',
      createdAt: new Date(),
      deliveryAddress: orderData.address,
      customerName: orderData.name,
      customerPhone: orderData.phone,
    };
    
    setCurrentOrder(order);
    setOrderHistory(prev => [order, ...prev]);
    setCart([]);
    setShowCart(false);
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-900/80 backdrop-blur-md border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-purple-600 rounded-full flex items-center justify-center">
                  <Moon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                  OWLDelivery
                </h1>
                <p className="text-xs text-gray-400">Ночная доставка 24/7</p>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400"
                />
              </div>
            </div>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCart(true)}
                className="relative p-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-full transition-all duration-200 group"
              >
                <ShoppingCart className="w-6 h-6 text-gray-300 group-hover:text-white" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-r from-orange-400 to-purple-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                    {getTotalItems()}
                  </span>
                )}
              </button>

              {user ? (
                <button
                  onClick={handleUserClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 rounded-full transition-all duration-200 transform hover:scale-105"
                >
                  <User className="w-5 h-5 text-white" />
                  <span className="text-white font-medium">{user.name}</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white font-medium rounded-full transition-all duration-200 transform hover:scale-105"
                >
                  Войти
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 to-orange-900/20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Ночная доставка
              <span className="block bg-gradient-to-r from-orange-400 to-purple-400 bg-clip-text text-transparent">
                продуктов
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Доставляем свежие продукты круглосуточно. Быстро, удобно, всегда свежее.
            </p>
            <div className="flex items-center justify-center space-x-8 text-gray-300">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-400" />
                <span>24/7</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <span>По всему городу</span>
              </div>
              <div className="flex items-center space-x-2">
                <Package className="w-5 h-5 text-orange-400" />
                <span>30 мин доставка</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-gray-800/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                }`}
              >
                {category === 'all' ? 'Все товары' : 
                 category === 'fruits' ? 'Фрукты' :
                 category === 'vegetables' ? 'Овощи' :
                 category === 'dairy' ? 'Молочное' :
                 category === 'snacks' ? 'Снэки' : 'Напитки'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
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
          onLogin={setUser}
          onModeChange={setAuthMode}
        />
      )}

      {showCart && (
        <Cart
          items={cart}
          onClose={() => setShowCart(false)}
          onRemove={removeFromCart}
          onUpdateQuantity={updateCartQuantity}
          total={getTotalPrice()}
          onCheckout={handleCheckout}
        />
      )}

      {showUserProfile && user && (
        <UserProfile
          user={user}
          orderHistory={orderHistory}
          currentOrder={currentOrder}
          onClose={() => setShowUserProfile(false)}
          onTrackOrder={handleTrackOrder}
          onLogout={() => {
            setUser(null);
            setShowUserProfile(false);
            setCurrentOrder(null);
            setOrderHistory([]);
            setCart([]);
          }}
        />
      )}

      {currentOrder && (
        <OrderTracking
          order={currentOrder}
          onClose={() => setCurrentOrder(null)}
        />
      )}
    </div>
  );
}

export default App;