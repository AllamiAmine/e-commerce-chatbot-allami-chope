import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product, Category } from '../../models/product.model';
import { AMAZON_PRODUCTS, AMAZON_CATEGORIES } from '../../data/amazon-products';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, HeaderComponent, RouterLink],
  template: `
    <app-header></app-header>
    <main class="min-h-screen bg-background">
      <!-- Header Section -->
      <div class="bg-gradient-to-br from-primary/20 via-accent/10 to-background py-12 md:py-16">
        <div class="container px-4 md:px-6 mx-auto text-center">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <span>🛍️</span>
            <span>{{ allProducts.length }} produits disponibles</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Catalogue Amazon
            <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Premium</span>
          </h1>
          <p class="text-muted-foreground text-lg max-w-2xl mx-auto">Découvrez notre sélection de produits Amazon avec les meilleures marques mondiales</p>
        </div>
      </div>

      <div class="container px-4 md:px-6 py-12 mx-auto">
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <!-- Categories Sidebar -->
          <div class="lg:col-span-1">
            <div class="sticky top-24 space-y-4">
              <div class="bg-card rounded-2xl border border-border p-4 shadow-sm">
                <h2 class="text-lg font-bold mb-4 text-foreground flex items-center gap-2">
                  <span>📂</span> Catégories
                </h2>
                <div class="space-y-1">
                  <button
                    (click)="selectCategory(0)"
                    [class]="'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ' + 
                      (selectedCategory() === 0 
                        ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                        : 'hover:bg-muted text-foreground')"
                  >
                    <div class="flex items-center gap-3">
                      <span class="text-xl">🌟</span>
                      <span class="font-medium">Tous les produits</span>
                    </div>
                    <span class="text-xs px-2 py-1 rounded-full bg-white/20">{{ allProducts.length }}</span>
                  </button>
                  @for (category of categories; track category.id) {
                    <button
                      (click)="selectCategory(category.id)"
                      [class]="'w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ' + 
                        (selectedCategory() === category.id 
                          ? 'bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25' 
                          : 'hover:bg-muted text-foreground')"
                    >
                      <div class="flex items-center gap-3">
                        <span class="text-xl">{{ category.icon }}</span>
                        <span class="font-medium">{{ category.name }}</span>
                      </div>
                      <span class="text-xs px-2 py-1 rounded-full" [class]="selectedCategory() === category.id ? 'bg-white/20' : 'bg-muted'">
                        {{ getProductCount(category.id) }}
                      </span>
                    </button>
                  }
                </div>
              </div>
              
              <!-- Stats Card -->
              <div class="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 border border-primary/20">
                <h3 class="font-semibold text-foreground mb-3">📊 Statistiques</h3>
                <div class="space-y-2 text-sm">
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Produits</span>
                    <span class="font-bold text-foreground">{{ allProducts.length }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Catégories</span>
                    <span class="font-bold text-foreground">{{ categories.length }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-muted-foreground">Marques</span>
                    <span class="font-bold text-foreground">50+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Products Grid -->
          <div class="lg:col-span-4">
            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <h2 class="text-2xl font-bold text-foreground">{{ selectedCategoryName }}</h2>
                <p class="text-muted-foreground mt-1">{{ currentProducts.length }} produits trouvés</p>
              </div>
              <div class="flex items-center gap-2">
                <select 
                  class="px-4 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:ring-2 focus:ring-primary/20"
                  (change)="sortProducts($event)"
                >
                  <option value="default">Trier par</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                  <option value="rating">Meilleures notes</option>
                  <option value="reviews">Plus d'avis</option>
                </select>
              </div>
            </div>

            @if (currentProducts.length === 0) {
              <div class="text-center py-16">
                <div class="text-6xl mb-4">📦</div>
                <h3 class="text-xl font-semibold text-foreground mb-2">Aucun produit trouvé</h3>
                <p class="text-muted-foreground">Essayez une autre catégorie</p>
              </div>
            } @else {
              <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (product of currentProducts; track product.id) {
                  <div class="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300">
                    <!-- Image Container -->
                    <div class="relative aspect-square bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                      <a [routerLink]="['/products', product.id]">
                        <img
                          [src]="product.image"
                          [alt]="product.name"
                          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          loading="lazy"
                          (error)="onImageError($event)"
                        />
                      </a>
                      @if (product.badge) {
                        <span class="absolute top-3 left-3 px-3 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg">
                          {{ product.badge }}
                        </span>
                      }
                      <div class="absolute top-3 right-3 flex flex-col gap-2">
                        <button
                          (click)="toggleWishlist(product.id)"
                          class="p-2.5 rounded-full bg-white/90 hover:bg-white shadow-lg transition-all hover:scale-110"
                        >
                          <svg
                            class="w-5 h-5 transition-colors"
                            [class.fill-red-500]="isInWishlist(product.id)"
                            [class.text-red-500]="isInWishlist(product.id)"
                            [class.text-gray-600]="!isInWishlist(product.id)"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            fill="none"
                          >
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                      <!-- Quick Add Overlay -->
                      <div class="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          (click)="addToCart(product)"
                          class="w-full py-3 bg-white text-foreground rounded-xl font-semibold hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                          </svg>
                          Ajouter au panier
                        </button>
                      </div>
                    </div>

                    <!-- Content -->
                    <div class="p-5">
                      <a [routerLink]="['/products', product.id]" class="block">
                        <h3 class="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                          {{ product.name }}
                        </h3>
                      </a>
                      
                      @if (product.description) {
                        <p class="text-sm text-muted-foreground mb-3 line-clamp-2">{{ product.description }}</p>
                      }

                      <!-- Rating -->
                      <div class="flex items-center gap-2 mb-4">
                        <div class="flex items-center">
                          @for (star of [1,2,3,4,5]; track star) {
                            <svg 
                              [class]="'w-4 h-4 ' + (star <= product.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300')"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                          }
                        </div>
                        <span class="text-sm font-medium text-foreground">{{ product.rating }}</span>
                        <span class="text-xs text-muted-foreground">({{ product.reviews }} avis)</span>
                      </div>

                      <!-- Price and Button -->
                      <div class="flex items-center justify-between">
                        <div>
                          <span class="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {{ product.price | number:'1.0-0' }}
                          </span>
                          <span class="text-sm text-primary font-medium"> MAD</span>
                        </div>
                        <button
                          (click)="addToCart(product)"
                          class="h-11 w-11 rounded-xl inline-flex items-center justify-center bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/25"
                        >
                          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                          </svg>
                        </button>
                      </div>
                      
                      @if (product.stock && product.stock > 0) {
                        <div class="mt-3 flex items-center gap-2 text-xs">
                          <span class="w-2 h-2 rounded-full bg-green-500"></span>
                          <span class="text-green-600 font-medium">En stock ({{ product.stock }})</span>
                        </div>
                      }
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </main>
  `
})
export class CategoriesComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  // Use Amazon products directly for guaranteed data
  categories: Category[] = AMAZON_CATEGORIES;
  allProducts: Product[] = AMAZON_PRODUCTS;
  
  selectedCategory = signal(0); // 0 = All products
  wishlist: number[] = [];
  sortBy = 'default';

  ngOnInit(): void {
    // Also try to get from service (in case backend is available)
    const serviceCategories = this.productService.getCategories();
    const serviceProducts = this.productService.getProducts();
    
    if (serviceCategories.length > 0) {
      this.categories = serviceCategories;
    }
    if (serviceProducts.length > 0) {
      this.allProducts = serviceProducts;
    }
  }

  get currentProducts(): Product[] {
    let products = this.selectedCategory() === 0 
      ? this.allProducts 
      : this.allProducts.filter(p => p.categoryId === this.selectedCategory());
    
    // Apply sorting
    switch (this.sortBy) {
      case 'price-asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...products].sort((a, b) => b.rating - a.rating);
      case 'reviews':
        return [...products].sort((a, b) => b.reviews - a.reviews);
      default:
        return products;
    }
  }

  get selectedCategoryName(): string {
    if (this.selectedCategory() === 0) return 'Tous les produits';
    return this.categories.find(c => c.id === this.selectedCategory())?.name || '';
  }

  getProductCount(categoryId: number): number {
    return this.allProducts.filter(p => p.categoryId === categoryId).length;
  }

  selectCategory(id: number): void {
    this.selectedCategory.set(id);
  }

  sortProducts(event: Event): void {
    this.sortBy = (event.target as HTMLSelectElement).value;
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
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=800&fit=crop&q=80';
  }
}

