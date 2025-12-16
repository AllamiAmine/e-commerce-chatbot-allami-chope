import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, Category } from '../../models/product.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <app-header></app-header>
    <main class="min-h-screen bg-background">
      <!-- Header Section -->
      <div class="bg-gradient-to-r from-primary/10 to-accent/10 py-8 md:py-12">
        <div class="container px-4 md:px-6 mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-2">Parcourir les catégories</h1>
          <p class="text-muted-foreground">Découvrez nos produits sélectionnés par catégorie</p>
        </div>
      </div>

      <div class="container px-4 md:px-6 py-12 mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <!-- Categories Sidebar -->
          <div class="lg:col-span-1">
            <div class="sticky top-24">
              <h2 class="text-lg font-bold mb-4 text-foreground">Catégories</h2>
              <div class="space-y-2">
                @for (category of categories; track category.id) {
                  <button
                    (click)="selectCategory(category.id)"
                    [class]="'w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ' + 
                      (selectedCategory() === category.id 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : 'hover:bg-secondary/50 text-foreground')"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl">{{ category.icon }}</span>
                      <span class="font-medium">{{ category.name }}</span>
                    </div>
                    @if (selectedCategory() === category.id) {
                      <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                    }
                  </button>
                }
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="lg:col-span-3">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-foreground">{{ selectedCategoryName }}</h2>
              <p class="text-muted-foreground mt-1">{{ currentProducts.length }} produits disponibles</p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              @for (product of currentProducts; track product.id) {
                <div class="rounded-lg border border-border bg-card text-card-foreground shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                  <!-- Image Container -->
                  <div class="relative aspect-square bg-muted overflow-hidden group">
                    <img
                      [src]="product.image"
                      [alt]="product.name"
                      class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      (error)="onImageError($event)"
                    />
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
                    <h3 class="font-semibold text-foreground mb-2 line-clamp-2">{{ product.name }}</h3>

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
        </div>
      </div>
    </main>
  `
})
export class CategoriesComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  categories = this.productService.getCategories();
  selectedCategory = signal(1);
  wishlist: number[] = [];

  get currentProducts(): Product[] {
    return this.productService.getProductsByCategory(this.selectedCategory());
  }

  get selectedCategoryName(): string {
    return this.categories.find(c => c.id === this.selectedCategory())?.name || '';
  }

  selectCategory(id: number): void {
    this.selectedCategory.set(id);
  }

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
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }
}

