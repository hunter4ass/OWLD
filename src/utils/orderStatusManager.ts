import { Order } from '../types';

const STATUS_PROGRESSION = {
  pending: { next: 'preparing', delay: 5000 }, // 5 секунд
  preparing: { next: 'collecting', delay: 10000 }, // 10 секунд
  collecting: { next: 'delivering', delay: 15000 }, // 15 секунд
  delivering: { next: 'delivered', delay: 20000 }, // 20 секунд
  delivered: { next: null, delay: 0 }
};

class OrderStatusManager {
  private static intervals: Map<string, NodeJS.Timeout> = new Map();

  static startStatusProgression(order: Order, onStatusChange: (order: Order) => void) {
    // Останавливаем предыдущий интервал для этого заказа, если он существует
    this.stopProgression(order.id);

    const progression = STATUS_PROGRESSION[order.status];
    if (!progression || !progression.next) return;

    const interval = setInterval(() => {
      const updatedOrder: Order = {
        ...order,
        status: progression.next as Order['status']
      };

      onStatusChange(updatedOrder);

      // Если достигли финального статуса, останавливаем прогрессию
      if (progression.next === 'delivered') {
        this.stopProgression(order.id);
      } else {
        // Запускаем следующий этап
        this.startStatusProgression(updatedOrder, onStatusChange);
      }
    }, progression.delay);

    this.intervals.set(order.id, interval);
  }

  static stopProgression(orderId: string) {
    const interval = this.intervals.get(orderId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(orderId);
    }
  }

  static stopAllProgressions() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();
  }

  static getStatusInfo(status: Order['status']) {
    const statusConfig = {
      pending: {
        title: 'Заказ оформлен',
        description: 'Ваш заказ принят и ожидает обработки',
        progress: 0,
        color: 'text-yellow-400'
      },
      preparing: {
        title: 'Готовится',
        description: 'Ваш заказ готовится на кухне',
        progress: 25,
        color: 'text-orange-400'
      },
      collecting: {
        title: 'Собирается',
        description: 'Заказ собирается для доставки',
        progress: 50,
        color: 'text-blue-400'
      },
      delivering: {
        title: 'В пути',
        description: 'Курьер везет ваш заказ',
        progress: 75,
        color: 'text-purple-400'
      },
      delivered: {
        title: 'Доставлен',
        description: 'Заказ успешно доставлен',
        progress: 100,
        color: 'text-green-400'
      }
    };

    return statusConfig[status];
  }

  static getEstimatedTime(order: Order): string {
    const now = new Date();
    const estimated = new Date(order.estimatedDelivery);
    const diff = estimated.getTime() - now.getTime();
    
    if (diff <= 0) return 'Скоро';
    
    const minutes = Math.ceil(diff / (1000 * 60));
    return `${minutes} мин`;
  }
}

export { OrderStatusManager }; 