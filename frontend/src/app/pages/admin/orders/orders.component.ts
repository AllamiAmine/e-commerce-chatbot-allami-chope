import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { firstValueFrom } from 'rxjs';

interface AdminOrder {
  id: string;
  orderId?: number; // Real order ID from database
  customerName: string;
  customerEmail: string;
  date: Date;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  itemCount: number;
  paymentMethod: string;
  shippingAddress: string;
}

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-muted/30">
      <!-- Header -->
      <header class="bg-background border-b border-border sticky top-0 z-40">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <a routerLink="/admin" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span class="hidden sm:inline">Retour</span>
              </a>
              <div class="h-6 w-px bg-border"></div>
              <h1 class="text-xl font-bold text-foreground flex items-center gap-2">
                📦 Gestion des Commandes
              </h1>
            </div>
            <button class="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              <span class="hidden sm:inline">Exporter</span>
            </button>
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-8">
        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          @for (stat of orderStats(); track stat.status) {
            <button
              (click)="filterStatus = stat.status"
              [class]="'bg-background rounded-xl border-2 p-4 text-left transition-all ' +
                (filterStatus === stat.status ? 'border-primary shadow-lg' : 'border-border hover:border-primary/50')"
            >
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">{{ stat.icon }}</span>
                <span class="text-xs text-muted-foreground">{{ stat.label }}</span>
              </div>
              <p class="text-2xl font-bold text-foreground">{{ stat.count }}</p>
            </button>
          }
        </div>

        <!-- Filters -->
        <div class="bg-background rounded-2xl border border-border p-4 mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Rechercher par ID, client ou email..."
                class="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <input
              type="date"
              [(ngModel)]="filterDate"
              class="px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button 
              (click)="clearFilters()"
              class="px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-background rounded-2xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-muted/50 border-b border-border">
                <tr>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Commande</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Client</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground hidden md:table-cell">Date</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Statut</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground hidden lg:table-cell">Paiement</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Total</th>
                  <th class="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (order of filteredOrders(); track order.id) {
                  <tr class="border-b border-border hover:bg-muted/30 transition-colors">
                    <td class="px-6 py-4">
                      <div>
                        <p class="font-medium text-foreground font-mono">#{{ order.id }}</p>
                        <p class="text-xs text-muted-foreground">{{ order.itemCount }} article(s)</p>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div>
                        <p class="font-medium text-foreground">{{ order.customerName }}</p>
                        <p class="text-xs text-muted-foreground">{{ order.customerEmail }}</p>
                      </div>
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell">
                      <span class="text-sm text-muted-foreground">{{ formatDate(order.date) }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <select
                        [(ngModel)]="order.status"
                        (change)="updateOrderStatus(order)"
                        [class]="'px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ' + getStatusClass(order.status)"
                      >
                        <option value="pending">⏳ En attente</option>
                        <option value="processing">⚙️ En préparation</option>
                        <option value="shipped">🚚 Expédiée</option>
                        <option value="delivered">✅ Livrée</option>
                        <option value="cancelled">❌ Annulée</option>
                      </select>
                    </td>
                    <td class="px-6 py-4 hidden lg:table-cell">
                      <span class="text-sm text-muted-foreground">{{ order.paymentMethod }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span class="font-semibold text-primary">{{ order.total.toFixed(2) }} MAD</span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <button 
                          (click)="viewOrder(order)"
                          class="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Voir détails"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                          </svg>
                        </button>
                        <button 
                          (click)="printOrder(order)"
                          class="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Imprimer"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Order Detail Modal -->
      @if (selectedOrder()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeOrderModal()">
          <div class="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-foreground">
                Commande #{{ selectedOrder()?.id }}
              </h2>
              <button (click)="closeOrderModal()" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="space-y-6">
              <!-- Customer Info -->
              <div class="grid grid-cols-2 gap-4">
                <div class="p-4 bg-muted/50 rounded-xl">
                  <p class="text-xs text-muted-foreground mb-1">Client</p>
                  <p class="font-medium text-foreground">{{ selectedOrder()?.customerName }}</p>
                  <p class="text-sm text-muted-foreground">{{ selectedOrder()?.customerEmail }}</p>
                </div>
                <div class="p-4 bg-muted/50 rounded-xl">
                  <p class="text-xs text-muted-foreground mb-1">Adresse de livraison</p>
                  <p class="text-sm text-foreground">{{ selectedOrder()?.shippingAddress }}</p>
                </div>
              </div>

              <!-- Order Info -->
              <div class="grid grid-cols-3 gap-4">
                <div class="p-4 bg-muted/50 rounded-xl text-center">
                  <p class="text-xs text-muted-foreground mb-1">Date</p>
                  <p class="font-medium text-foreground">{{ formatDate(selectedOrder()?.date!) }}</p>
                </div>
                <div class="p-4 bg-muted/50 rounded-xl text-center">
                  <p class="text-xs text-muted-foreground mb-1">Paiement</p>
                  <p class="font-medium text-foreground">{{ selectedOrder()?.paymentMethod }}</p>
                </div>
                <div class="p-4 bg-muted/50 rounded-xl text-center">
                  <p class="text-xs text-muted-foreground mb-1">Total</p>
                  <p class="font-bold text-primary">{{ selectedOrder()?.total?.toFixed(2) }} MAD</p>
                </div>
              </div>

              <!-- Status Update -->
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Mettre à jour le statut</label>
                <select
                  [(ngModel)]="selectedOrder()!.status"
                  class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="pending">⏳ En attente</option>
                  <option value="processing">⚙️ En préparation</option>
                  <option value="shipped">🚚 Expédiée</option>
                  <option value="delivered">✅ Livrée</option>
                  <option value="cancelled">❌ Annulée</option>
                </select>
              </div>

              <!-- Actions -->
              <div class="flex gap-3">
                <button class="flex-1 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2">
                  <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                  </svg>
                  Imprimer facture
                </button>
                <button class="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminOrdersComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  searchQuery = '';
  filterStatus = '';
  filterDate = '';
  
  selectedOrder = signal<AdminOrder | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  orders: AdminOrder[] = [];
  orderStats = signal([
    { status: '', label: 'Toutes', icon: '📊', count: 0 },
    { status: 'pending', label: 'En attente', icon: '⏳', count: 0 },
    { status: 'processing', label: 'En cours', icon: '⚙️', count: 0 },
    { status: 'shipped', label: 'Expédiées', icon: '🚚', count: 0 },
    { status: 'delivered', label: 'Livrées', icon: '✅', count: 0 },
  ]);

  constructor() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const response = await firstValueFrom(this.apiService.getAllOrdersAdmin());
      
      if (response.success && response.data) {
        this.orders = response.data.map((o: any) => ({
          id: o.orderNumber || o.id?.toString() || 'N/A',
          orderId: o.id, // Store real database ID
          customerName: o.userName || 'Client inconnu',
          customerEmail: o.userEmail || '',
          date: new Date(o.createdAt || o.date || Date.now()),
          status: (o.status || 'pending').toLowerCase(),
          total: o.total || 0,
          itemCount: (o.items || o.orderItems || []).length,
          paymentMethod: o.paymentMethod || 'Non spécifié',
          shippingAddress: o.shippingAddress || 'Non spécifiée'
        }));

        // Update stats
        this.orderStats.set([
          { status: '', label: 'Toutes', icon: '📊', count: this.orders.length },
          { status: 'pending', label: 'En attente', icon: '⏳', count: this.orders.filter(o => o.status === 'pending').length },
          { status: 'processing', label: 'En cours', icon: '⚙️', count: this.orders.filter(o => o.status === 'processing').length },
          { status: 'shipped', label: 'Expédiées', icon: '🚚', count: this.orders.filter(o => o.status === 'shipped').length },
          { status: 'delivered', label: 'Livrées', icon: '✅', count: this.orders.filter(o => o.status === 'delivered').length },
        ]);

        console.log('✅ Orders loaded from MySQL:', this.orders.length);
      } else {
        this.errorMessage.set('Aucune commande trouvée');
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to load orders from backend:', error.message);
      this.errorMessage.set('Impossible de charger les commandes depuis MySQL.');
    } finally {
      this.isLoading.set(false);
    }
  }

  filteredOrders = computed(() => {
    let result = this.orders;
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(query) ||
        o.customerName.toLowerCase().includes(query) ||
        o.customerEmail.toLowerCase().includes(query)
      );
    }
    
    if (this.filterStatus) {
      result = result.filter(o => o.status === this.filterStatus);
    }
    
    return result;
  });

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
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

  clearFilters(): void {
    this.searchQuery = '';
    this.filterStatus = '';
    this.filterDate = '';
  }

  async updateOrderStatus(order: AdminOrder): Promise<void> {
    if (!order.orderId) {
      this.errorMessage.set('ID de commande manquant');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const response = await firstValueFrom(
        this.apiService.updateOrderStatus(order.orderId, order.status.toUpperCase())
      );

      if (response.success) {
        await this.loadOrders();
        this.successMessage.set(`Statut de la commande ${order.id} mis à jour avec succès`);
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        this.errorMessage.set(response.message || 'Erreur lors de la mise à jour');
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      this.errorMessage.set(error?.error?.message || error?.message || 'Erreur lors de la mise à jour');
    } finally {
      this.isLoading.set(false);
    }
  }

  viewOrder(order: AdminOrder): void {
    this.selectedOrder.set(order);
  }

  closeOrderModal(): void {
    this.selectedOrder.set(null);
  }

  printOrder(order: AdminOrder): void {
    window.print();
  }
}

