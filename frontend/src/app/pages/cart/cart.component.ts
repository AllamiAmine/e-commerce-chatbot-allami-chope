import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header></app-header>
      <main class="container mx-auto px-4 md:px-6 py-8">
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 mb-8">
          <a routerLink="/" class="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </a>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2">
            <div class="flex items-center justify-between mb-6">
              <div>
                <h1 class="text-3xl font-bold mb-2">Mon Panier</h1>
                @if (isLoggedIn()) {
                  <p class="text-sm text-muted-foreground flex items-center gap-2">
                    <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Panier personnel de <strong>{{ userName() }}</strong>
                  </p>
                } @else {
                  <p class="text-sm text-muted-foreground flex items-center gap-2">
                    <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                    </svg>
                    Panier temporaire - <a routerLink="/login" class="text-primary hover:underline">Connectez-vous</a> pour sauvegarder votre panier
                  </p>
                }
              </div>
              @if (cartService.cartItems().length > 0) {
                <div class="text-right">
                  <p class="text-sm text-muted-foreground">Total d'articles</p>
                  <p class="text-2xl font-bold text-primary">{{ cartService.cartCount() }}</p>
                </div>
              }
            </div>

            @if (cartService.cartItems().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 bg-card rounded-lg border border-border">
                <svg class="w-16 h-16 text-muted-foreground mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h2 class="text-xl font-semibold mb-2">Votre panier est vide</h2>
                <p class="text-muted-foreground mb-6">Commencez vos achats dès maintenant</p>
                <a routerLink="/" class="h-10 px-4 py-2 rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center">
                  Continuer vos achats
                </a>
              </div>
            } @else {
              <div class="space-y-4">
                @for (item of cartService.cartItems(); track item.product.id) {
                  <div class="flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
                    <!-- Product Image -->
                    <a [routerLink]="['/products', item.product.id]" class="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0 block">
                      <img 
                        [src]="item.product.image" 
                        [alt]="item.product.name" 
                        class="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        (error)="onImageError($event)" 
                      />
                    </a>

                    <!-- Product Details -->
                    <div class="flex-1 min-w-0">
                      <a [routerLink]="['/products', item.product.id]" class="block">
                        <h3 class="font-semibold text-foreground mb-1 hover:text-primary transition-colors line-clamp-2">{{ item.product.name }}</h3>
                      </a>
                      <p class="text-sm text-muted-foreground mb-2">Prix unitaire: {{ item.product.price.toFixed(2) }} MAD</p>
                      
                      @if (item.quantity > 1) {
                        <p class="text-xs text-primary mb-3 font-medium">
                          {{ item.quantity }} × {{ item.product.price.toFixed(2) }} MAD = {{ (item.product.price * item.quantity).toFixed(2) }} MAD
                        </p>
                      }
                      
                      <!-- Quantity Control -->
                      <div class="flex items-center gap-3">
                        <button
                          (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)"
                          [disabled]="item.quantity <= 1"
                          class="p-1.5 hover:bg-secondary/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-border"
                          aria-label="Diminuer la quantité"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span class="w-12 text-center font-semibold text-lg bg-muted px-3 py-1 rounded-lg">{{ item.quantity }}</span>
                        <button
                          (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)"
                          class="p-1.5 hover:bg-secondary/30 rounded-lg transition-colors border border-border"
                          aria-label="Augmenter la quantité"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                        <span class="text-xs text-muted-foreground ml-2">quantité</span>
                      </div>
                    </div>

                    <!-- Price and Remove -->
                    <div class="text-right flex flex-col justify-between">
                      <div>
                        <p class="text-lg font-bold text-primary mb-1">{{ (item.product.price * item.quantity).toFixed(2) }} MAD</p>
                        @if (item.quantity > 1) {
                          <p class="text-xs text-muted-foreground">Total pour {{ item.quantity }} articles</p>
                        }
                      </div>
                      <button
                        (click)="cartService.removeFromCart(item.product.id)"
                        class="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors self-end"
                        aria-label="Supprimer du panier"
                        title="Supprimer du panier"
                      >
                        <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <div class="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 class="text-xl font-bold mb-6">Résumé de la commande</h2>

              <div class="space-y-4 mb-6 pb-6 border-b border-border">
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Sous-total</span>
                  <span class="font-semibold">{{ cartService.subtotal().toFixed(2) }} MAD</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Livraison</span>
                  <span class="font-semibold">{{ shipping().toFixed(2) }} MAD</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Taxes</span>
                  <span class="font-semibold">{{ tax().toFixed(2) }} MAD</span>
                </div>
              </div>

              <div class="flex justify-between items-center mb-6">
                <span class="font-bold">Total</span>
                <span class="text-2xl font-bold text-primary">{{ total().toFixed(2) }} MAD</span>
              </div>

              <a routerLink="/checkout" class="w-full h-10 px-4 py-2 rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground mb-3 inline-flex items-center justify-center">
                Procéder au paiement
              </a>
              <a routerLink="/" class="w-full h-10 px-4 py-2 rounded-lg font-medium border border-input bg-transparent hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center">
                Continuer vos achats
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class CartComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);

  // Use computed signals for better performance
  shipping = computed(() => this.cartService.cartItems().length > 0 ? 99.9 : 0);
  tax = computed(() => this.cartService.subtotal() * 0.1);
  total = computed(() => this.cartService.subtotal() + this.shipping() + this.tax());
  itemCount = computed(() => this.cartService.cartCount());
  userName = computed(() => this.authService.user()?.name || '');
  isLoggedIn = computed(() => this.authService.isLoggedIn());

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop&q=80';
    img.loading = 'lazy';
  }
}

