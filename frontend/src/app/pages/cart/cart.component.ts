import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { CartService } from '../../services/cart.service';

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
            <h1 class="text-3xl font-bold mb-6">Mon Panier</h1>

            @if (cartService.items().length === 0) {
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
                @for (item of cartService.items(); track item.id) {
                  <div class="flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
                    <!-- Product Image -->
                    <div class="w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      <img [src]="item.image" [alt]="item.name" class="w-full h-full object-cover" (error)="onImageError($event)" />
                    </div>

                    <!-- Product Details -->
                    <div class="flex-1">
                      <h3 class="font-semibold text-foreground mb-1">{{ item.name }}</h3>
                      <p class="text-sm text-muted-foreground mb-3">Prix unitaire: {{ item.price.toFixed(2) }} MAD</p>
                      
                      <!-- Quantity Control -->
                      <div class="flex items-center gap-3">
                        <button
                          (click)="cartService.updateQuantity(item.id, item.quantity - 1)"
                          class="p-1 hover:bg-secondary/30 rounded-lg transition-colors"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                          </svg>
                        </button>
                        <span class="w-8 text-center font-semibold">{{ item.quantity }}</span>
                        <button
                          (click)="cartService.updateQuantity(item.id, item.quantity + 1)"
                          class="p-1 hover:bg-secondary/30 rounded-lg transition-colors"
                        >
                          <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Price and Remove -->
                    <div class="text-right">
                      <p class="text-lg font-bold text-primary mb-4">{{ (item.price * item.quantity).toFixed(2) }} MAD</p>
                      <button
                        (click)="cartService.removeFromCart(item.id)"
                        class="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        aria-label="Supprimer du panier"
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
                  <span class="font-semibold">{{ shipping.toFixed(2) }} MAD</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-muted-foreground">Taxes</span>
                  <span class="font-semibold">{{ tax.toFixed(2) }} MAD</span>
                </div>
              </div>

              <div class="flex justify-between items-center mb-6">
                <span class="font-bold">Total</span>
                <span class="text-2xl font-bold text-primary">{{ total.toFixed(2) }} MAD</span>
              </div>

              <button class="w-full h-10 px-4 py-2 rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground mb-3">
                Procéder au paiement
              </button>
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

  get shipping(): number {
    return this.cartService.items().length > 0 ? 99.9 : 0;
  }

  get tax(): number {
    return this.cartService.subtotal() * 0.1;
  }

  get total(): number {
    return this.cartService.subtotal() + this.shipping + this.tax;
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }
}

