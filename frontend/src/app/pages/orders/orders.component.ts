import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';

interface Order {
  id: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: {
    id: number;
    name: string;
    image: string;
    quantity: number;
    price: number;
  }[];
  trackingNumber?: string;
  estimatedDelivery?: Date;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header></app-header>
      
      <main class="container mx-auto px-4 md:px-6 py-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-foreground">Mes commandes</h1>
            <p class="text-muted-foreground mt-1">Suivez et gérez vos commandes</p>
          </div>
          <div class="flex gap-2">
            @for (filter of statusFilters; track filter.value) {
              <button
                (click)="activeFilter = filter.value"
                [class]="'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' +
                  (activeFilter === filter.value 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-foreground hover:bg-muted/80')"
              >
                {{ filter.label }}
              </button>
            }
          </div>
        </div>

        <!-- Orders List -->
        @if (filteredOrders().length === 0) {
          <div class="bg-card border border-border rounded-2xl p-12 text-center">
            <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center text-4xl">
              📦
            </div>
            <h2 class="text-xl font-semibold text-foreground mb-2">Aucune commande</h2>
            <p class="text-muted-foreground mb-6">Vous n'avez pas encore passé de commande</p>
            <a routerLink="/" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
              Commencer mes achats
            </a>
          </div>
        } @else {
          <div class="space-y-6">
            @for (order of filteredOrders(); track order.id) {
              <div class="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
                <!-- Order Header -->
                <div class="p-6 border-b border-border bg-muted/30">
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span class="text-xl">{{ getStatusIcon(order.status) }}</span>
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h3 class="font-semibold text-foreground">Commande #{{ order.id }}</h3>
                          <span [class]="'px-3 py-1 rounded-full text-xs font-medium ' + getStatusClass(order.status)">
                            {{ getStatusLabel(order.status) }}
                          </span>
                        </div>
                        <p class="text-sm text-muted-foreground">
                          Passée le {{ formatDate(order.date) }}
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center gap-4">
                      <div class="text-right">
                        <p class="text-sm text-muted-foreground">Total</p>
                        <p class="text-xl font-bold text-primary">{{ order.total.toFixed(2) }} MAD</p>
                      </div>
                      <button 
                        (click)="toggleOrderDetails(order.id)"
                        class="p-2 hover:bg-muted rounded-lg transition-colors"
                      >
                        <svg 
                          [class]="'w-5 h-5 transition-transform ' + (expandedOrder() === order.id ? 'rotate-180' : '')" 
                          fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Order Progress -->
                @if (order.status !== 'cancelled') {
                  <div class="px-6 py-4 bg-muted/10">
                    <div class="flex items-center justify-between">
                      @for (step of orderSteps; track step.status; let i = $index) {
                        <div class="flex items-center gap-2 flex-1">
                          <div [class]="'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ' +
                            (isStepComplete(order.status, step.status) 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground')">
                            @if (isStepComplete(order.status, step.status)) {
                              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                              </svg>
                            } @else {
                              {{ i + 1 }}
                            }
                          </div>
                          <span [class]="'text-xs hidden sm:inline ' + 
                            (isStepComplete(order.status, step.status) ? 'text-foreground font-medium' : 'text-muted-foreground')">
                            {{ step.label }}
                          </span>
                          @if (i < orderSteps.length - 1) {
                            <div [class]="'flex-1 h-1 mx-2 rounded ' + 
                              (isStepComplete(order.status, step.status) && i < getStepIndex(order.status) ? 'bg-primary' : 'bg-muted')">
                            </div>
                          }
                        </div>
                      }
                    </div>
                  </div>
                }

                <!-- Order Details (Expanded) -->
                @if (expandedOrder() === order.id) {
                  <div class="p-6 border-t border-border space-y-6">
                    <!-- Items -->
                    <div>
                      <h4 class="font-semibold text-foreground mb-4">Articles commandés</h4>
                      <div class="space-y-3">
                        @for (item of order.items; track item.id) {
                          <div class="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                            <img [src]="item.image" [alt]="item.name" class="w-16 h-16 object-cover rounded-lg" />
                            <div class="flex-1">
                              <p class="font-medium text-foreground">{{ item.name }}</p>
                              <p class="text-sm text-muted-foreground">Quantité: {{ item.quantity }}</p>
                            </div>
                            <p class="font-semibold text-primary">{{ (item.price * item.quantity).toFixed(2) }} MAD</p>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Tracking Info -->
                    @if (order.trackingNumber) {
                      <div class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <span class="text-2xl">🚚</span>
                            <div>
                              <p class="text-sm text-blue-800 font-medium">Numéro de suivi</p>
                              <p class="font-mono text-blue-600">{{ order.trackingNumber }}</p>
                            </div>
                          </div>
                          <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                            Suivre le colis
                          </button>
                        </div>
                      </div>
                    }

                    @if (order.estimatedDelivery && order.status !== 'delivered') {
                      <div class="flex items-center gap-3 text-muted-foreground">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                        </svg>
                        <span>Livraison estimée: {{ formatDate(order.estimatedDelivery) }}</span>
                      </div>
                    }

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-3 pt-4 border-t border-border">
                      @if (order.status === 'delivered') {
                        <button class="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                          </svg>
                          Laisser un avis
                        </button>
                        <button class="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2">
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                          </svg>
                          Commander à nouveau
                        </button>
                      }
                      @if (order.status === 'pending' || order.status === 'processing') {
                        <button class="px-4 py-2 text-destructive border border-destructive/30 rounded-xl hover:bg-destructive/10 transition-colors">
                          Annuler la commande
                        </button>
                      }
                      <button class="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        Télécharger la facture
                      </button>
                      <button class="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Aide
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </main>
    </div>
  `
})
export class OrdersComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  activeFilter = 'all';
  expandedOrder = signal<string | null>(null);

  statusFilters = [
    { value: 'all', label: 'Toutes' },
    { value: 'pending', label: 'En attente' },
    { value: 'processing', label: 'En cours' },
    { value: 'shipped', label: 'Expédiées' },
    { value: 'delivered', label: 'Livrées' }
  ];

  orderSteps = [
    { status: 'pending', label: 'Confirmée' },
    { status: 'processing', label: 'Préparation' },
    { status: 'shipped', label: 'Expédiée' },
    { status: 'delivered', label: 'Livrée' }
  ];

  // Demo orders
  orders: Order[] = [
    {
      id: 'SHP-12458963',
      date: new Date('2024-12-20'),
      status: 'shipped',
      total: 3499.80,
      trackingNumber: 'MA123456789',
      estimatedDelivery: new Date('2024-12-26'),
      items: [
        { id: 1, name: 'Écouteurs Bluetooth Premium', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150', quantity: 2, price: 1499.90 },
        { id: 2, name: 'Montre Intelligente Ultra', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150', quantity: 1, price: 499.00 }
      ]
    },
    {
      id: 'SHP-12458852',
      date: new Date('2024-12-15'),
      status: 'delivered',
      total: 2999.90,
      items: [
        { id: 3, name: 'Caméra Numérique 4K', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150', quantity: 1, price: 2999.90 }
      ]
    },
    {
      id: 'SHP-12458741',
      date: new Date('2024-12-10'),
      status: 'processing',
      total: 899.90,
      items: [
        { id: 5, name: 'Enceinte Portable Bluetooth', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=150', quantity: 1, price: 899.90 }
      ]
    }
  ];

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  filteredOrders = () => {
    if (this.activeFilter === 'all') {
      return this.orders;
    }
    return this.orders.filter(o => o.status === this.activeFilter);
  };

  toggleOrderDetails(orderId: string): void {
    this.expandedOrder.update(current => current === orderId ? null : orderId);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: '⏳',
      processing: '⚙️',
      shipped: '🚚',
      delivered: '✅',
      cancelled: '❌'
    };
    return icons[status] || '📦';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: 'En attente',
      processing: 'En préparation',
      shipped: 'Expédiée',
      delivered: 'Livrée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-700',
      processing: 'bg-blue-100 text-blue-700',
      shipped: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700',
      cancelled: 'bg-red-100 text-red-700'
    };
    return classes[status] || 'bg-gray-100 text-gray-700';
  }

  getStepIndex(status: string): number {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    return statusOrder.indexOf(status);
  }

  isStepComplete(orderStatus: string, stepStatus: string): boolean {
    const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
    return statusOrder.indexOf(orderStatus) >= statusOrder.indexOf(stepStatus);
  }
}


