import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { ProductService } from '../../services/product.service';
import { ROLE_INFO } from '../../models/user.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-muted/30">
      <!-- Header -->
      <header class="bg-background border-b border-border sticky top-0 z-40">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <a routerLink="/" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span class="hidden sm:inline">Retour au site</span>
              </a>
              <div class="h-6 w-px bg-border"></div>
              <h1 class="text-xl font-bold text-foreground flex items-center gap-2">
                👑 Administration
              </h1>
            </div>
            <div class="flex items-center gap-3">
              <div class="text-right hidden sm:block">
                <p class="text-sm font-medium">{{ authService.user()?.name }}</p>
                <p class="text-xs text-muted-foreground">Administrateur</p>
              </div>
              <div class="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {{ getUserInitials() }}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-8">
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          @for (stat of stats(); track stat.label) {
            <div class="bg-background rounded-2xl border border-border p-6 hover:shadow-lg transition-shadow">
              <div class="flex items-center justify-between mb-4">
                <div [class]="'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xl ' + stat.color">
                  {{ stat.icon }}
                </div>
                @if (stat.trend !== 0) {
                  <span [class]="'text-xs px-2 py-1 rounded-full ' + (stat.trend > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600')">
                    {{ stat.trend > 0 ? '+' : '' }}{{ stat.trend }}%
                  </span>
                }
              </div>
              @if (isLoading()) {
                <div class="h-8 w-24 bg-muted animate-pulse rounded mb-2"></div>
              } @else {
                <h3 class="text-2xl font-bold text-foreground">{{ stat.value }}</h3>
              }
              <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <h2 class="text-lg font-semibold text-foreground mb-4">Actions rapides</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          @for (action of quickActions; track action.title) {
            <a 
              [routerLink]="action.route"
              class="bg-background rounded-2xl border border-border p-6 hover:shadow-lg hover:border-primary/50 transition-all group"
            >
              <div class="flex items-start gap-4">
                <div [class]="'w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform ' + action.color">
                  {{ action.icon }}
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-foreground group-hover:text-primary transition-colors">{{ action.title }}</h3>
                  <p class="text-sm text-muted-foreground mt-1">{{ action.description }}</p>
                </div>
                <svg class="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
          }
        </div>

        <!-- Recent Activity -->
        <div class="bg-background rounded-2xl border border-border p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-foreground">Activité récente</h2>
            <button class="text-sm text-primary hover:underline">Voir tout</button>
          </div>
          <div class="space-y-4">
            @for (activity of recentActivity; track activity.id) {
              <div class="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                <div [class]="'w-10 h-10 rounded-full flex items-center justify-center text-lg ' + activity.bgColor">
                  {{ activity.icon }}
                </div>
                <div class="flex-1">
                  <p class="text-sm text-foreground">{{ activity.message }}</p>
                  <p class="text-xs text-muted-foreground">{{ activity.time }}</p>
                </div>
                <span [class]="'text-xs px-2 py-1 rounded-full ' + activity.badgeColor">
                  {{ activity.badge }}
                </span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private productService = inject(ProductService);

  isLoading = signal(false);
  
  stats = signal([
    { label: 'Utilisateurs', value: '0', icon: '👥', color: 'from-blue-500 to-blue-600', trend: 0 },
    { label: 'Commandes', value: '0', icon: '📦', color: 'from-green-500 to-green-600', trend: 0 },
    { label: 'Produits', value: '0', icon: '🛍️', color: 'from-purple-500 to-purple-600', trend: 0 },
    { label: 'Revenus', value: '0 MAD', icon: '💰', color: 'from-orange-500 to-orange-600', trend: 0 },
  ]);

  quickActions = [
    { 
      title: 'Gérer les utilisateurs', 
      description: 'Voir, modifier et supprimer les utilisateurs',
      icon: '👥',
      color: 'from-blue-500 to-blue-600',
      route: '/admin/users'
    },
    { 
      title: 'Gérer les produits', 
      description: 'Ajouter, modifier et supprimer les produits',
      icon: '🛍️',
      color: 'from-purple-500 to-purple-600',
      route: '/admin/products'
    },
    { 
      title: 'Gérer les commandes', 
      description: 'Voir et traiter les commandes clients',
      icon: '📦',
      color: 'from-green-500 to-green-600',
      route: '/admin/orders'
    },
    { 
      title: 'Statistiques', 
      description: 'Analyser les performances de la boutique',
      icon: '📊',
      color: 'from-orange-500 to-orange-600',
      route: '/admin/analytics'
    },
    { 
      title: 'Paramètres', 
      description: 'Configurer la boutique et les options',
      icon: '⚙️',
      color: 'from-gray-500 to-gray-600',
      route: '/admin/settings'
    },
    { 
      title: 'ChatBot IA', 
      description: 'Configurer l\'assistant intelligent',
      icon: '🤖',
      color: 'from-pink-500 to-pink-600',
      route: '/admin/chatbot'
    },
  ];

  recentActivity = [
    { id: 1, icon: '👤', message: 'Nouvel utilisateur inscrit: Ahmed M.', time: 'Il y a 5 min', badge: 'Client', bgColor: 'bg-blue-100', badgeColor: 'bg-blue-100 text-blue-600' },
    { id: 2, icon: '📦', message: 'Nouvelle commande #12459 - 2,499 MAD', time: 'Il y a 12 min', badge: 'Commande', bgColor: 'bg-green-100', badgeColor: 'bg-green-100 text-green-600' },
    { id: 3, icon: '🏪', message: 'Nouveau vendeur inscrit: Boutique Tech', time: 'Il y a 1h', badge: 'Vendeur', bgColor: 'bg-purple-100', badgeColor: 'bg-purple-100 text-purple-600' },
    { id: 4, icon: '⭐', message: 'Nouvel avis 5 étoiles sur Écouteurs Bluetooth', time: 'Il y a 2h', badge: 'Avis', bgColor: 'bg-yellow-100', badgeColor: 'bg-yellow-100 text-yellow-600' },
    { id: 5, icon: '🚚', message: 'Commande #12455 livrée avec succès', time: 'Il y a 3h', badge: 'Livraison', bgColor: 'bg-green-100', badgeColor: 'bg-green-100 text-green-600' },
  ];

  constructor() {
    // Check if user is admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loadStats();
  }

  async loadStats(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      // Load users stats
      const usersResponse = await firstValueFrom(this.apiService.getAllUsers());
      const usersCount = usersResponse.success && usersResponse.data ? usersResponse.data.length : 0;
      const activeUsers = usersResponse.success && usersResponse.data 
        ? usersResponse.data.filter((u: any) => u.status === 'ACTIVE' || u.status === 'active').length 
        : 0;

      // Load products stats
      const products = this.productService.getProducts();
      const productsCount = products.length;
      const inStockProducts = products.filter(p => (p.stock || 0) > 0).length;

      // Load orders stats (try to get from API)
      let ordersCount = 0;
      let revenue = 0;
      try {
        const ordersResponse = await firstValueFrom(this.apiService.getOrders());
        if (ordersResponse.success && ordersResponse.data) {
          ordersCount = ordersResponse.data.length;
          revenue = ordersResponse.data.reduce((sum: number, order: any) => {
            return sum + (order.total || order.totalAmount || 0);
          }, 0);
        }
      } catch (error) {
        console.warn('Could not load orders:', error);
      }

      // Calculate trends (simplified - could be improved with historical data)
      const previousUsers = 0; // Would come from historical data
      const previousOrders = 0;
      const previousProducts = 0;
      const previousRevenue = 0;

      const usersTrend = previousUsers > 0 ? Math.round(((usersCount - previousUsers) / previousUsers) * 100) : 0;
      const ordersTrend = previousOrders > 0 ? Math.round(((ordersCount - previousOrders) / previousOrders) * 100) : 0;
      const productsTrend = previousProducts > 0 ? Math.round(((productsCount - previousProducts) / previousProducts) * 100) : 0;
      const revenueTrend = previousRevenue > 0 ? Math.round(((revenue - previousRevenue) / previousRevenue) * 100) : 0;

      this.stats.set([
        { 
          label: 'Utilisateurs', 
          value: usersCount.toLocaleString('fr-FR'), 
          icon: '👥', 
          color: 'from-blue-500 to-blue-600', 
          trend: usersTrend 
        },
        { 
          label: 'Commandes', 
          value: ordersCount.toLocaleString('fr-FR'), 
          icon: '📦', 
          color: 'from-green-500 to-green-600', 
          trend: ordersTrend 
        },
        { 
          label: 'Produits', 
          value: productsCount.toLocaleString('fr-FR'), 
          icon: '🛍️', 
          color: 'from-purple-500 to-purple-600', 
          trend: productsTrend 
        },
        { 
          label: 'Revenus', 
          value: revenue.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' MAD', 
          icon: '💰', 
          color: 'from-orange-500 to-orange-600', 
          trend: revenueTrend 
        },
      ]);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getUserInitials(): string {
    const user = this.authService.user();
    if (!user?.name) return 'A';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }
}

