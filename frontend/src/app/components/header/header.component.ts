import { Component, inject, OnInit, HostListener, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { ChatbotService } from '../../services/chatbot.service';
import { ROLE_INFO } from '../../models/user.model';
import { ThemeService } from '../../services/theme.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
              ALLAMI <span class="text-primary">SHOP</span>
            </span>
            <span class="block text-[10px] text-muted-foreground -mt-1">
              Premium Mobile Store
            </span>
          </div>
        </a>

        <!-- Search Bar -->
        <div class="hidden md:flex flex-1 max-w-lg mx-6">
          <div class="relative w-full group">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (input)="onSearchInput()"
              (focus)="showSearchResults.set(true)"
              (keydown.enter)="handleSearchEnter()"
              (keydown.escape)="closeSearch()"
              placeholder="Rechercher des produits avec l'IA..."
              class="w-full pl-11 pr-20 py-2.5 rounded-xl border border-input bg-muted/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:bg-background focus:border-transparent transition-all"
            />
            @if (searchQuery().length > 0) {
              <button
                (click)="clearSearch()"
                class="absolute right-12 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            }
            <kbd class="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-6 items-center gap-1 rounded-md border border-border bg-muted px-2 font-mono text-xs text-muted-foreground">
              ⌘K
            </kbd>
            
            <!-- Search Results Dropdown -->
            @if (showSearchResults() && (searchQuery().length > 0 || searchResults().length > 0)) {
              <div class="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-2xl z-50 max-h-[500px] overflow-y-auto">
                @if (isSearching()) {
                  <div class="p-6 text-center">
                    <svg class="w-8 h-8 text-primary animate-spin mx-auto mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                    </svg>
                    <p class="text-sm text-muted-foreground">Recherche IA en cours...</p>
                  </div>
                } @else if (searchResults().length > 0) {
                  <div class="p-2">
                    <div class="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Résultats ({{ searchResults().length }})
                    </div>
                    @for (product of searchResults(); track product.id) {
                      <button
                        (click)="selectProduct(product)"
                        class="w-full flex items-center gap-3 px-3 py-3 hover:bg-muted rounded-lg transition-colors text-left group"
                      >
                        <div class="relative w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                          <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform">
                        </div>
                        <div class="flex-1 min-w-0">
                          <p class="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                            {{ product.name }}
                          </p>
                          <div class="flex items-center gap-2 mt-1">
                            <span class="text-sm font-bold text-primary">{{ product.price | number:'1.0-0' }} MAD</span>
                            <div class="flex items-center gap-1">
                              <svg class="w-3 h-3 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              <span class="text-xs text-muted-foreground">{{ product.rating }}</span>
                            </div>
                          </div>
                        </div>
                        <svg class="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    }
                    <div class="border-t border-border mt-2 pt-2 px-3 pb-2">
                      <button
                        (click)="openChatbotWithQuery()"
                        class="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors text-sm font-medium"
                      >
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <circle cx="12" cy="12" r="3"/>
                          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                        </svg>
                        Demander à l'IA : "{{ searchQuery() }}"
                      </button>
                    </div>
                  </div>
                } @else if (searchQuery().length >= 2) {
                  <div class="p-6 text-center">
                    <svg class="w-12 h-12 text-muted-foreground mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p class="text-sm font-medium text-foreground mb-1">Aucun résultat trouvé</p>
                    <p class="text-xs text-muted-foreground mb-4">Essayez avec d'autres mots-clés</p>
                    <button
                      (click)="openChatbotWithQuery()"
                      class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                    >
                      <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"/>
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                      </svg>
                      Demander à l'IA
                    </button>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Navigation -->
        <nav class="hidden lg:flex items-center gap-1">
          <a routerLink="/categories" class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Produits
          </a>
          <a 
            (click)="scrollToSection('services', $event)"
            class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Services
          </a>
          <a 
            (click)="scrollToSection('deals', $event)"
            class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            Offres
          </a>
          <a 
            (click)="scrollToSection('about', $event)"
            class="px-4 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
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
          <button 
            (click)="showMobileSearch.set(true)"
            class="md:hidden p-2.5 hover:bg-muted rounded-lg transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          <!-- Mobile Search Modal -->
          @if (showMobileSearch()) {
            <div class="fixed inset-0 bg-black/50 z-50 md:hidden" (click)="showMobileSearch.set(false)">
              <div class="bg-background rounded-t-2xl p-4 mt-auto" (click)="$event.stopPropagation()">
                <div class="flex items-center gap-3 mb-4">
                  <div class="relative flex-1">
                    <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      [(ngModel)]="searchQuery"
                      (input)="onSearchInput()"
                      (keydown.enter)="handleSearchEnter()"
                      placeholder="Rechercher avec l'IA..."
                      class="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-muted/50 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      autofocus
                    />
                  </div>
                  <button
                    (click)="showMobileSearch.set(false)"
                    class="p-2 hover:bg-muted rounded-lg"
                  >
                    <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                @if (searchResults().length > 0) {
                  <div class="max-h-[60vh] overflow-y-auto space-y-2">
                    @for (product of searchResults(); track product.id) {
                      <button
                        (click)="selectProduct(product)"
                        class="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg"
                      >
                        <img [src]="product.image" [alt]="product.name" class="w-16 h-16 rounded-lg object-cover">
                        <div class="flex-1 text-left">
                          <p class="font-medium text-sm">{{ product.name }}</p>
                          <p class="text-sm font-bold text-primary">{{ product.price | number:'1.0-0' }} MAD</p>
                        </div>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          }

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
                      routerLink="/wishlist"
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
export class HeaderComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  productService = inject(ProductService);
  chatbotService = inject(ChatbotService);
  router = inject(Router);

  showUserMenu = false;
  searchQuery = signal('');
  searchResults = signal<Product[]>([]);
  showSearchResults = signal(false);
  showMobileSearch = signal(false);
  isSearching = signal(false);
  private searchTimeout: any;

  ngOnInit(): void {
    effect(() => {
      if (this.showSearchResults()) {
        setTimeout(() => {
          document.addEventListener('click', this.handleClickOutside.bind(this));
        }, 0);
      } else {
        document.removeEventListener('click', this.handleClickOutside.bind(this));
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
      event.preventDefault();
      const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        this.showSearchResults.set(true);
      }
    }
  }

  onSearchInput(): void {
    const query = this.searchQuery().trim();
    
    if (query.length < 2) {
      this.searchResults.set([]);
      this.isSearching.set(false);
      return;
    }

    this.isSearching.set(true);
    this.showSearchResults.set(true);

    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch(query);
    }, 300);
  }

  private async performSearch(query: string): Promise<void> {
    try {
      const allProducts = this.productService.getProducts();
      const results = allProducts.filter(product => {
        const searchLower = query.toLowerCase();
        const nameMatch = product.name.toLowerCase().includes(searchLower);
        const descMatch = product.description?.toLowerCase().includes(searchLower);
        const categoryMatch = this.productService.getCategories()
          .find(cat => cat.id === product.categoryId)?.name.toLowerCase().includes(searchLower);
        
        return nameMatch || descMatch || categoryMatch;
      });

      results.sort((a, b) => {
        const aNameMatch = a.name.toLowerCase().includes(query.toLowerCase());
        const bNameMatch = b.name.toLowerCase().includes(query.toLowerCase());
        if (aNameMatch && !bNameMatch) return -1;
        if (!aNameMatch && bNameMatch) return 1;
        return b.rating - a.rating; // Then by rating
      });

      this.searchResults.set(results.slice(0, 8)); // Limit to 8 results
    } catch (error) {
      console.error('Search error:', error);
      this.searchResults.set([]);
    } finally {
      this.isSearching.set(false);
    }
  }

  handleSearchEnter(): void {
    if (this.searchResults().length > 0) {
      this.selectProduct(this.searchResults()[0]);
    } else if (this.searchQuery().trim().length > 0) {
      this.openChatbotWithQuery();
    }
  }

  selectProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
    this.closeSearch();
  }

  openChatbotWithQuery(): void {
    sessionStorage.setItem('chatbotQuery', this.searchQuery());
    this.router.navigate(['/']);
    this.closeSearch();
    
    setTimeout(() => {
      const chatbotButton = document.querySelector('button[class*="fixed bottom-6 right-6"]') as HTMLElement;
      if (chatbotButton) {
        chatbotButton.click();
        setTimeout(() => {
          const chatbotInput = document.querySelector('input[placeholder*="Posez votre question"]') as HTMLInputElement;
          if (chatbotInput) {
            chatbotInput.value = this.searchQuery();
            chatbotInput.dispatchEvent(new Event('input', { bubbles: true }));
            const sendButton = chatbotInput.nextElementSibling as HTMLElement;
            if (sendButton) sendButton.click();
          }
        }, 500);
      }
    }, 100);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.searchResults.set([]);
    this.showSearchResults.set(false);
  }

  closeSearch(): void {
    this.showSearchResults.set(false);
    this.showMobileSearch.set(false);
  }

  private handleClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.relative.w-full.group') && !target.closest('.absolute.top-full')) {
      this.showSearchResults.set(false);
    }
  }

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

  scrollToSection(sectionId: string, event: Event): void {
    event.preventDefault();
    
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.scrollToElement(sectionId), 100);
      });
    } else {
      this.scrollToElement(sectionId);
    }
  }

  private scrollToElement(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
