import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <section class="py-16 md:py-24 bg-background">
      <div class="container px-4 md:px-6 mx-auto">
        <!-- Section Header -->
        <div class="mb-12 text-center">
          <h2 class="text-3xl md:text-4xl font-bold mb-3 text-balance">Produits recommandés pour vous</h2>
          <p class="text-muted-foreground max-w-2xl mx-auto">
            Sélection personnalisée basée sur vos préférences et tendances actuelles
          </p>
        </div>

        <!-- Products Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          @for (product of products; track product.id) {
            <div class="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
              <!-- Image Container -->
              <div class="relative aspect-square bg-muted overflow-hidden">
                <a [routerLink]="['/products', product.id]" class="block w-full h-full">
                  <img
                    [src]="product.image"
                    [alt]="product.name"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    (error)="onImageError($event)"
                  />
                </a>
                @if (product.badge) {
                  <div class="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
                    {{ product.badge }}
                  </div>
                }
                <button
                  (click)="toggleWishlist(product.id)"
                  class="absolute top-3 right-3 p-2 rounded-full bg-background/80 hover:bg-background transition-colors"
                >
                  <svg
                    class="w-5 h-5 transition-colors"
                    [class.fill-destructive]="isInWishlist(product.id)"
                    [class.text-destructive]="isInWishlist(product.id)"
                    [class.text-foreground]="!isInWishlist(product.id)"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>

              <!-- Content -->
              <div class="p-4">
                <a [routerLink]="['/products', product.id]">
                  <h3 class="font-semibold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
                    {{ product.name }}
                  </h3>
                </a>

                <!-- Rating -->
                <div class="flex items-center gap-1 mb-3">
                  <div class="flex">
                    @for (star of [1,2,3,4,5]; track star) {
                      <span class="text-sm">{{ star <= product.rating ? '⭐' : '☆' }}</span>
                    }
                  </div>
                  <span class="text-xs text-muted-foreground">({{ product.reviews }})</span>
                </div>

                <!-- Price and Button -->
                <div class="flex items-center justify-between">
                  <span class="text-xl font-bold text-primary">{{ product.price.toFixed(2) }} MAD</span>
                  <button
                    (click)="addToCart(product)"
                    class="h-9 px-3 rounded-md text-sm inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                  >
                    <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span class="hidden sm:inline">Ajouter</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class ProductsComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  
  products = this.productService.getProducts();
  wishlist: number[] = [];

  toggleWishlist(id: number): void {
    if (this.wishlist.includes(id)) {
      this.wishlist = this.wishlist.filter(item => item !== id);
    } else {
      this.wishlist = [...this.wishlist, id];
    }
  }

  isInWishlist(id: number): boolean {
    return this.wishlist.includes(id);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=800&fit=crop&q=80';
  }
}

