import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';
import { firstValueFrom } from 'rxjs';

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  shippingAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  total: number;
}

export interface CreateOrderData {
  shippingAddress: string;
  paymentMethod: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  private ordersSignal = signal<Order[]>([]);
  private loadingSignal = signal<boolean>(false);

  readonly orders = this.ordersSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  async loadUserOrders(): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    this.loadingSignal.set(true);
    try {
      const response = await firstValueFrom(
        this.apiService.getOrdersByUser(parseInt(user.id))
      );
      if (response.success && response.data) {
        this.ordersSignal.set(response.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async createOrder(data: CreateOrderData): Promise<{ success: boolean; message: string; order?: Order }> {
    const user = this.authService.user();
    if (!user) {
      return { success: false, message: 'Vous devez être connecté pour passer une commande' };
    }

    const cartItems = this.cartService.cartItems();
    if (cartItems.length === 0) {
      return { success: false, message: 'Votre panier est vide' };
    }

    this.loadingSignal.set(true);
    try {
      const orderData = {
        userId: parseInt(user.id),
        userName: user.name,
        userEmail: user.email,
        shippingAddress: data.shippingAddress,
        paymentMethod: data.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.product.id,
          productName: item.product.name,
          productImage: item.product.image,
          price: item.product.price,
          quantity: item.quantity
        }))
      };

      const response = await firstValueFrom(this.apiService.createOrder(orderData));
      
      if (response.success && response.data) {
        // Clear cart after successful order
        this.cartService.clearCart();
        // Reload orders
        await this.loadUserOrders();
        return { success: true, message: 'Commande créée avec succès', order: response.data };
      }

      return { success: false, message: response.message || 'Échec de la création de la commande' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erreur lors de la création de la commande' };
    } finally {
      this.loadingSignal.set(false);
    }
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    try {
      const response = await firstValueFrom(this.apiService.getOrderByNumber(orderNumber));
      if (response.success && response.data) {
        return response.data;
      }
    } catch (error) {
      console.error('Failed to get order:', error);
    }
    return null;
  }

  async cancelOrder(orderId: number): Promise<{ success: boolean; message: string }> {
    this.loadingSignal.set(true);
    try {
      const response = await firstValueFrom(this.apiService.cancelOrder(orderId));
      if (response.success) {
        await this.loadUserOrders();
        return { success: true, message: 'Commande annulée avec succès' };
      }
      return { success: false, message: response.message || 'Échec de l\'annulation' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Erreur lors de l\'annulation' };
    } finally {
      this.loadingSignal.set(false);
    }
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      'PENDING': 'En attente',
      'CONFIRMED': 'Confirmée',
      'PROCESSING': 'En préparation',
      'SHIPPED': 'Expédiée',
      'DELIVERED': 'Livrée',
      'CANCELLED': 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'CONFIRMED': 'bg-blue-100 text-blue-800',
      'PROCESSING': 'bg-purple-100 text-purple-800',
      'SHIPPED': 'bg-indigo-100 text-indigo-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }
}

