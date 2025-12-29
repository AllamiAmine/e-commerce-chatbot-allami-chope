import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ProductService } from '../../../services/product.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-analytics',
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
                📊 Statistiques & Analytics
              </h1>
            </div>
            <div class="flex items-center gap-2">
              <select 
                [(ngModel)]="selectedPeriod"
                (change)="loadAnalytics()"
                class="px-4 py-2 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7">7 derniers jours</option>
                <option value="30">30 derniers jours</option>
                <option value="90">3 derniers mois</option>
                <option value="365">Année</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-8">
        <!-- Key Metrics -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          @for (metric of keyMetrics(); track metric.label) {
            <div class="bg-background rounded-2xl border border-border p-6">
              <div class="flex items-center justify-between mb-4">
                <div [class]="'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xl ' + metric.color">
                  {{ metric.icon }}
                </div>
                <span [class]="'text-xs px-2 py-1 rounded-full ' + (metric.change >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')">
                  {{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}%
                </span>
              </div>
              <h3 class="text-2xl font-bold text-foreground mb-1">{{ metric.value }}</h3>
              <p class="text-sm text-muted-foreground">{{ metric.label }}</p>
            </div>
          }
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Sales Chart -->
          <div class="bg-background rounded-2xl border border-border p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Ventes par jour</h2>
            <div class="h-64 flex items-end justify-between gap-2">
              @for (day of salesData(); track day.date) {
                <div class="flex-1 flex flex-col items-center gap-2">
                  <div 
                    class="w-full bg-primary rounded-t-lg transition-all hover:bg-primary/80 cursor-pointer"
                    [style.height.%]="day.amount / maxSales() * 100"
                    [title]="day.amount + ' MAD - ' + day.date"
                  ></div>
                  <span class="text-xs text-muted-foreground">{{ day.date }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Orders Chart -->
          <div class="bg-background rounded-2xl border border-border p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Commandes par jour</h2>
            <div class="h-64 flex items-end justify-between gap-2">
              @for (day of ordersData(); track day.date) {
                <div class="flex-1 flex flex-col items-center gap-2">
                  <div 
                    class="w-full bg-green-500 rounded-t-lg transition-all hover:bg-green-600 cursor-pointer"
                    [style.height.%]="day.count / maxOrders() * 100"
                    [title]="day.count + ' commandes - ' + day.date"
                  ></div>
                  <span class="text-xs text-muted-foreground">{{ day.date }}</span>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Top Products & Categories -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <!-- Top Products -->
          <div class="bg-background rounded-2xl border border-border p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Produits les plus vendus</h2>
            <div class="space-y-4">
              @for (product of topProducts(); track product.id; let i = $index) {
                <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                  <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {{ i + 1 }}
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-foreground">{{ product.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ product.sales }} ventes</p>
                  </div>
                  <span class="font-semibold text-primary">{{ product.revenue.toFixed(2) }} MAD</span>
                </div>
              } @empty {
                <p class="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
              }
            </div>
          </div>

          <!-- Category Distribution -->
          <div class="bg-background rounded-2xl border border-border p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Répartition par catégorie</h2>
            <div class="space-y-4">
              @for (category of categoryStats(); track category.name) {
                <div>
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-foreground">{{ category.icon }} {{ category.name }}</span>
                    <span class="text-sm text-muted-foreground">{{ category.percentage }}%</span>
                  </div>
                  <div class="w-full bg-muted rounded-full h-2">
                    <div 
                      class="bg-primary h-2 rounded-full transition-all"
                      [style.width.%]="category.percentage"
                    ></div>
                  </div>
                </div>
              } @empty {
                <p class="text-muted-foreground text-center py-8">Aucune donnée disponible</p>
              }
            </div>
          </div>
        </div>

        <!-- User Growth & Activity -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- User Growth -->
          <div class="bg-background rounded-2xl border border-border p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Croissance des utilisateurs</h2>
            <div class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Nouveaux utilisateurs</span>
                <span class="font-semibold text-foreground">{{ newUsers() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Utilisateurs actifs</span>
                <span class="font-semibold text-green-600">{{ activeUsers() }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Taux de conversion</span>
                <span class="font-semibold text-primary">{{ conversionRate().toFixed(1) }}%</span>
              </div>
            </div>
          </div>

          <!-- Order Status Distribution -->
          <div class="bg-background rounded-2xl border border-border p-6">
            <h2 class="text-lg font-semibold text-foreground mb-4">Statut des commandes</h2>
            <div class="space-y-3">
              @for (status of orderStatusStats(); track status.status) {
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span>{{ status.icon }}</span>
                    <span class="text-sm text-foreground">{{ status.label }}</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="text-sm text-muted-foreground">{{ status.count }} commandes</span>
                    <span class="text-xs px-2 py-1 rounded-full bg-muted">{{ status.percentage }}%</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminAnalyticsComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  private productService = inject(ProductService);

  selectedPeriod = 30;
  isLoading = signal(false);

  keyMetrics = signal([
    { label: 'Revenus totaux', value: '0 MAD', icon: '💰', color: 'from-orange-500 to-orange-600', change: 0 },
    { label: 'Commandes', value: '0', icon: '📦', color: 'from-green-500 to-green-600', change: 0 },
    { label: 'Panier moyen', value: '0 MAD', icon: '🛒', color: 'from-blue-500 to-blue-600', change: 0 },
    { label: 'Taux de conversion', value: '0%', icon: '📈', color: 'from-purple-500 to-purple-600', change: 0 },
  ]);

  salesData = signal<Array<{ date: string; amount: number }>>([]);
  ordersData = signal<Array<{ date: string; count: number }>>([]);
  topProducts = signal<Array<{ id: number; name: string; sales: number; revenue: number }>>([]);
  categoryStats = signal<Array<{ name: string; icon: string; percentage: number }>>([]);
  newUsers = signal(0);
  activeUsers = signal(0);
  orderStatusStats = signal<Array<{ status: string; label: string; icon: string; count: number; percentage: number }>>([]);

  ngOnInit(): void {
    this.loadAnalytics();
  }

  async loadAnalytics(): Promise<void> {
    this.isLoading.set(true);

    try {
      // Load users
      const usersResponse = await firstValueFrom(this.apiService.getAllUsers());
      const users = usersResponse.success && usersResponse.data ? usersResponse.data : [];
      this.activeUsers.set(users.filter((u: any) => u.status === 'ACTIVE' || u.status === 'active').length);
      this.newUsers.set(users.length); // Simplified

      // Load orders
      let orders: any[] = [];
      try {
        const ordersResponse = await firstValueFrom(this.apiService.getOrders());
        orders = ordersResponse.success && ordersResponse.data ? ordersResponse.data : [];
      } catch (error) {
        console.warn('Could not load orders:', error);
      }

      // Calculate metrics
      const totalRevenue = orders.reduce((sum, o) => sum + (o.total || o.totalAmount || 0), 0);
      const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
      const conversionRate = this.activeUsers() > 0 ? (orders.length / this.activeUsers()) * 100 : 0;

      // Generate sales data (last 7 days)
      const salesData = this.generateSalesData(orders);
      const ordersData = this.generateOrdersData(orders);

      // Top products
      const topProducts = this.calculateTopProducts(orders);

      // Category stats
      const categories = this.productService.getCategories();
      const categoryStats = this.calculateCategoryStats(categories, orders);

      // Order status stats
      const statusStats = this.calculateOrderStatusStats(orders);

      this.keyMetrics.set([
        { 
          label: 'Revenus totaux', 
          value: totalRevenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD', 
          icon: '💰', 
          color: 'from-orange-500 to-orange-600', 
          change: 15 
        },
        { 
          label: 'Commandes', 
          value: orders.length.toString(), 
          icon: '📦', 
          color: 'from-green-500 to-green-600', 
          change: 8 
        },
        { 
          label: 'Panier moyen', 
          value: avgOrderValue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD', 
          icon: '🛒', 
          color: 'from-blue-500 to-blue-600', 
          change: 5 
        },
        { 
          label: 'Taux de conversion', 
          value: conversionRate.toFixed(1) + '%', 
          icon: '📈', 
          color: 'from-purple-500 to-purple-600', 
          change: 12 
        },
      ]);

      this.salesData.set(salesData);
      this.ordersData.set(ordersData);
      this.topProducts.set(topProducts);
      this.categoryStats.set(categoryStats);
      this.orderStatusStats.set(statusStats);

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private generateSalesData(orders: any[]): Array<{ date: string; amount: number }> {
    const days = 7;
    const data: Array<{ date: string; amount: number }> = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      
      const dayOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt || o.date || o.created_at);
        return orderDate.toDateString() === date.toDateString();
      });

      const amount = dayOrders.reduce((sum: number, o: any) => sum + (o.total || o.totalAmount || 0), 0);
      data.push({ date: dateStr, amount });
    }

    return data;
  }

  private generateOrdersData(orders: any[]): Array<{ date: string; count: number }> {
    const days = 7;
    const data: Array<{ date: string; count: number }> = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
      
      const dayOrders = orders.filter((o: any) => {
        const orderDate = new Date(o.createdAt || o.date || o.created_at);
        return orderDate.toDateString() === date.toDateString();
      });

      data.push({ date: dateStr, count: dayOrders.length });
    }

    return data;
  }

  private calculateTopProducts(orders: any[]): Array<{ id: number; name: string; sales: number; revenue: number }> {
    const productMap = new Map<number, { name: string; sales: number; revenue: number }>();

    orders.forEach((order: any) => {
      const items = order.items || order.orderItems || [];
      items.forEach((item: any) => {
        const productId = item.productId || item.product?.id;
        const productName = item.productName || item.product?.name || 'Produit inconnu';
        const quantity = item.quantity || 1;
        const price = item.price || item.product?.price || 0;

        if (productMap.has(productId)) {
          const existing = productMap.get(productId)!;
          existing.sales += quantity;
          existing.revenue += price * quantity;
        } else {
          productMap.set(productId, {
            name: productName,
            sales: quantity,
            revenue: price * quantity
          });
        }
      });
    });

    return Array.from(productMap.entries())
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private calculateCategoryStats(categories: any[], orders: any[]): Array<{ name: string; icon: string; percentage: number }> {
    const categoryMap = new Map<number, number>();
    let totalItems = 0;

    orders.forEach((order: any) => {
      const items = order.items || order.orderItems || [];
      items.forEach((item: any) => {
        const categoryId = item.categoryId || item.product?.categoryId;
        if (categoryId) {
          categoryMap.set(categoryId, (categoryMap.get(categoryId) || 0) + (item.quantity || 1));
          totalItems += item.quantity || 1;
        }
      });
    });

    return categories.map(cat => {
      const count = categoryMap.get(cat.id) || 0;
      return {
        name: cat.name,
        icon: cat.icon || '📦',
        percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
      };
    }).filter(cat => cat.percentage > 0).sort((a, b) => b.percentage - a.percentage);
  }

  private calculateOrderStatusStats(orders: any[]): Array<{ status: string; label: string; icon: string; count: number; percentage: number }> {
    const statusMap = new Map<string, number>();
    
    orders.forEach((order: any) => {
      const status = (order.status || 'pending').toLowerCase();
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const statusConfig: Record<string, { label: string; icon: string }> = {
      pending: { label: 'En attente', icon: '⏳' },
      processing: { label: 'En préparation', icon: '⚙️' },
      shipped: { label: 'Expédiée', icon: '🚚' },
      delivered: { label: 'Livrée', icon: '✅' },
      cancelled: { label: 'Annulée', icon: '❌' }
    };

    const total = orders.length;
    return Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        label: statusConfig[status]?.label || status,
        icon: statusConfig[status]?.icon || '📦',
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  maxSales(): number {
    const amounts = this.salesData().map(d => d.amount);
    return Math.max(...amounts, 1);
  }

  maxOrders(): number {
    const counts = this.ordersData().map(d => d.count);
    return Math.max(...counts, 1);
  }

  conversionRate(): number {
    const orders = this.ordersData().reduce((sum, d) => sum + d.count, 0);
    return this.activeUsers() > 0 ? (orders / this.activeUsers()) * 100 : 0;
  }
}

