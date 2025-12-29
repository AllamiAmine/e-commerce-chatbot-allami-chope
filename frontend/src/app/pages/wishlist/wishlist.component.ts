import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header></app-header>
      
      <main class="container mx-auto px-4 md:px-6 py-8">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 class="text-3xl font-bold text-foreground flex items-center gap-3">
              <span class="text-4xl">❤️</span>
              Ma liste de souhaits
            </h1>
            <p class="text-muted-foreground mt-1">{{ wishlistItems().length }} articles sauvegardés</p>
          </div>
          @if (wishlistItems().length > 0) {
            <div class="flex gap-3">
              <button 
                (click)="addAllToCart()"
                class="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Tout ajouter au panier
              </button>
              <button 
                (click)="clearWishlist()"
                class="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2"
              >
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Vider la liste
              </button>
            </div>
          }
        </div>

        <!-- Empty State -->
        @if (wishlistItems().length === 0) {
          <div class="bg-card border border-border rounded-2xl p-12 text-center">
            <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
              <svg class="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
              </svg>
            </div>
            <h2 class="text-2xl font-bold text-foreground mb-3">Votre liste est vide</h2>
            <p class="text-muted-foreground mb-6 max-w-md mx-auto">
              Sauvegardez vos produits préférés pour les retrouver facilement plus tard
            </p>
            <a routerLink="/categories" class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              Découvrir les produits
            </a>
          </div>
        } @else {
          <!-- Products Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (product of wishlistItems(); track product.id) {
              <div class="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all group">
                <!-- Image -->
                <div class="relative aspect-square bg-muted overflow-hidden">
                  <a [routerLink]="['/products', product.id]">
                    <img
                      [src]="product.image"
                      [alt]="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </a>
                  @if (product.badge) {
                    <span class="absolute top-3 left-3 px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
                      {{ product.badge }}
                    </span>
                  }
                  <button
                    (click)="removeFromWishlist(product.id)"
                    class="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-red-500 transition-colors shadow-lg"
                    title="Retirer de la liste"
                  >
                    <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                    </svg>
                  </button>
                  
                  <!-- Quick Add Overlay -->
                  <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      (click)="addToCart(product)"
                      class="w-full py-2 bg-white text-foreground rounded-xl font-medium hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center gap-2"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      Ajouter au panier
                    </button>
                  </div>
                </div>

                <!-- Content -->
                <div class="p-4">
                  <a [routerLink]="['/products', product.id]" class="block">
                    <h3 class="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                      {{ product.name }}
                    </h3>
                  </a>

                  <!-- Rating -->
                  <div class="flex items-center gap-2 mb-3">
                    <div class="flex">
                      @for (star of [1,2,3,4,5]; track star) {
                        <svg 
                          [class]="'w-4 h-4 ' + (star <= product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      }
                    </div>
                    <span class="text-xs text-muted-foreground">({{ product.reviews }})</span>
                  </div>

                  <!-- Price & Stock -->
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="text-xl font-bold text-primary">{{ product.price.toFixed(2) }}</span>
                      <span class="text-sm text-primary"> MAD</span>
                    </div>
                    @if (product.stock && product.stock > 0) {
                      <span class="text-xs text-green-600 flex items-center gap-1">
                        <span class="w-2 h-2 rounded-full bg-green-500"></span>
                        En stock
                      </span>
                    } @else {
                      <span class="text-xs text-red-500">Rupture</span>
                    }
                  </div>

                  <!-- Actions -->
                  <div class="flex gap-2 mt-4">
                    <button
                      (click)="addToCart(product)"
                      class="flex-1 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Ajouter au panier
                    </button>
                    <button
                      (click)="removeFromWishlist(product.id)"
                      class="p-2 border border-border rounded-xl hover:bg-destructive/10 hover:border-destructive transition-colors"
                      title="Supprimer"
                    >
                      <svg class="w-5 h-5 text-muted-foreground hover:text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Continue Shopping -->
          <div class="mt-12 text-center">
            <p class="text-muted-foreground mb-4">Vous cherchez autre chose ?</p>
            <a routerLink="/categories" class="inline-flex items-center gap-2 text-primary hover:underline">
              Continuer mes achats
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </a>
          </div>
        }
      </main>
    </div>
  `
})
export class WishlistComponent {
  private cartService = inject(CartService);
  private productService = inject(ProductService);

  // Simulated wishlist - in production, this would be a service
  private wishlistIds = signal<number[]>([1, 2, 5, 6]);

  wishlistItems = () => {
    const allProducts = this.productService.getProducts();
    return allProducts.filter(p => this.wishlistIds().includes(p.id));
  };

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  addAllToCart(): void {
    this.wishlistItems().forEach(product => {
      this.cartService.addToCart(product);
    });
  }

  removeFromWishlist(productId: number): void {
    this.wishlistIds.update(ids => ids.filter(id => id !== productId));
  }

  clearWishlist(): void {
    this.wishlistIds.set([]);
  }
}


