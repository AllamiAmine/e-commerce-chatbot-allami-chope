import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ROLE_INFO } from '../../models/user.model';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-lg">
      <div class="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <!-- Logo -->
        <a routerLink="/" class="flex items-center gap-3 group">
          <div class="relative">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div class="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
          </div>
          <div class="hidden sm:block">
            <span class="font-bold text-xl text-foreground tracking-wide">
              allami <span class="text-primary">chope</span>
            </span>
            <span class="block text-[10px] text-muted-foreground -mt-1">
              Premium Mobile Store
            </span>
          </div>
        </a>

        <!-- Search Bar -->
        <div class="hidden md:flex flex-1 max-w-lg mx-6">
          <div class="relative w-full group">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Rechercher des produits avec l'IA..."
              class="w-full pl-11 pr-4 py-2.5 rounded-xl border border-input bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background focus:border-transparent transition-all"
            />
            <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-6 items-center gap-1 rounded-md border border-border bg-muted px-2 font-mono text-xs text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="hidden lg:flex items-center gap-1">
          <a routerLink="/categories" class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Produits
          </a>
          <a href="#services" class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Services
          </a>
          <a href="#deals" class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Offres
          </a>
          <a href="#about" class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            À propos
          </a>
          @if (authService.isAdmin() || authService.isSeller()) {
            <a routerLink="/admin" class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1">
              Dashboard
              <span class="px-1.5 py-0.5 text-[10px] font-bold bg-purple-500 text-white rounded">PRO</span>
            </a>
          }
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-2">
          <!-- Mobile Search -->
          <button class="md:hidden p-2.5 hover:bg-muted rounded-lg transition-colors">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          <!-- Cart (only for clients) -->
          @if (!authService.isSeller()) {
            <a routerLink="/cart" class="relative p-2.5 hover:bg-muted rounded-lg transition-colors group">
              <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              @if (cartService.cartCount() > 0) {
                <span class="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center animate-pulse">
                  {{ cartService.cartCount() }}
                </span>
              }
            </a>
          }

          <!-- Theme toggle -->
          <button
            type="button"
            (click)="themeService.toggleTheme()"
            class="hidden md:inline-flex items-center justify-center p-2.5 rounded-lg hover:bg-muted transition-colors"
            [attr.aria-label]="themeService.theme() === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode sombre'"
          >
            <ng-container *ngIf="themeService.theme() === 'dark'; else sunIcon">
              <svg class="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </ng-container>
            <ng-template #sunIcon>
              <svg class="w-5 h-5 text-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.364-7.364-1.414 1.414M8.05 15.95l-1.414 1.414m0-12.728L8.05 8.05m9.9 9.9-1.414-1.414"/>
              </svg>
            </ng-template>
          </button>

          <!-- User Menu / Login Button -->
          @if (authService.isLoggedIn()) {
            <!-- Logged In User -->
            <div class="relative">
              <button
                (click)="showUserMenu = !showUserMenu"
                class="flex items-center gap-2 p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <div [class]="'w-8 h-8 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm ' + getRoleGradient()">
                  {{ getUserInitials() }}
                </div>
                <div class="hidden sm:block text-left">
                  <span class="text-sm font-medium text-foreground max-w-[100px] truncate block">
                    {{ authService.user()?.name }}
                  </span>
                  <span class="text-[10px] text-muted-foreground flex items-center gap-1">
                    {{ getRoleIcon() }} {{ getRoleLabel() }}
                  </span>
                </div>
                <svg class="w-4 h-4 text-muted-foreground hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              @if (showUserMenu) {
                <div class="absolute right-0 mt-2 w-64 bg-card border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <!-- User Info -->
                  <div class="px-3 py-3 border-b border-border mb-2">
                    <div class="flex items-center gap-3">
                      <div [class]="'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold ' + getRoleGradient()">
                        {{ getUserInitials() }}
                      </div>
                      <div>
                        <p class="font-medium text-sm">{{ authService.user()?.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ authService.user()?.email }}</p>
                        <span [class]="'inline-flex items-center gap-1 mt-1 text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r text-white ' + getRoleGradient()">
                          {{ getRoleIcon() }} {{ getRoleLabel() }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Role-based Menu -->
                  @if (authService.isAdmin()) {
                    <a
                      routerLink="/admin"
                      class="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                      (click)="showUserMenu = false"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Tableau de bord Admin
                    </a>
                    <a
                      routerLink="/admin/users"
                      class="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                      (click)="showUserMenu = false"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Gérer les utilisateurs
                    </a>
                  }

                  @if (authService.isSeller()) {
                    <a
                      routerLink="/seller"
                      class="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                      (click)="showUserMenu = false"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Mes Produits
                    </a>
                    <a
                      routerLink="/seller/orders"
                      class="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                      (click)="showUserMenu = false"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Commandes reçues
                    </a>
                  }

                  @if (authService.isClient()) {
                    <a
                      routerLink="/profile"
                      class="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                      (click)="showUserMenu = false"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Mon Profil
                    </a>
                    <a
                      routerLink="/orders"
                      class="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                      (click)="showUserMenu = false"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      Mes Commandes
                    </a>
                    <a
                      href="#"
                      class="flex items-center gap-3 px-3 py-2 text-foreground hover:bg-muted rounded-lg transition-colors text-sm"
                      (click)="showUserMenu = false"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Ma Wishlist
                    </a>
                  }

                  <div class="border-t border-border mt-2 pt-2">
                    <button
                      (click)="handleLogout()"
                      class="w-full flex items-center gap-3 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors text-sm"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Se déconnecter
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <!-- Not Logged In -->
            <div class="flex items-center gap-2">
              <a
                routerLink="/login"
                class="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Connexion
              </a>
              <a
                routerLink="/register"
                class="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span class="hidden sm:inline">S'inscrire</span>
              </a>
            </div>
          }
        </div>
      </div>
    </header>
  `
})
export class HeaderComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  showUserMenu = false;

  getUserInitials(): string {
    const user = this.authService.user();
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return user.name.substring(0, 2).toUpperCase();
  }

  getRoleGradient(): string {
    const role = this.authService.userRole();
    if (!role) return 'from-gray-500 to-gray-600';
    return ROLE_INFO[role].color;
  }

  getRoleIcon(): string {
    const role = this.authService.userRole();
    if (!role) return '👤';
    return ROLE_INFO[role].icon;
  }

  getRoleLabel(): string {
    const role = this.authService.userRole();
    if (!role) return 'Utilisateur';
    return ROLE_INFO[role].label;
  }

  handleLogout(): void {
    this.showUserMenu = false;
    this.authService.logout();
  }
}
