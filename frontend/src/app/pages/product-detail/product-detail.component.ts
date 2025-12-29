import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { RecommendationsComponent } from '../../components/recommendations/recommendations.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, RecommendationsComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header></app-header>
      <main class="container mx-auto px-4 md:px-6 py-8">
        <!-- Loading State -->
        @if (isLoading) {
          <div class="flex flex-col items-center justify-center py-20">
            <svg class="w-16 h-16 text-primary animate-spin mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            <p class="text-muted-foreground text-lg">Chargement du produit...</p>
          </div>
        }

        <!-- Product Not Found -->
        @else if (notFound || !product) {
          <div class="max-w-2xl mx-auto text-center py-20">
            <div class="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-6xl">
              🔍
            </div>
            <h1 class="text-4xl font-bold text-foreground mb-4">Produit introuvable</h1>
            <p class="text-muted-foreground mb-8 text-lg">
              Le produit que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <a routerLink="/categories" class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                Parcourir les produits
              </a>
              <a routerLink="/" class="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors inline-flex items-center justify-center gap-2">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                Retour à l'accueil
              </a>
            </div>
          </div>
        }

        <!-- Product Found -->
        @else if (product) {
        <!-- Breadcrumb -->
        <div class="flex items-center gap-2 mb-8">
          <a routerLink="/" class="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
              Accueil
          </a>
            <span class="text-muted-foreground">/</span>
            <a routerLink="/categories" class="text-muted-foreground hover:text-foreground transition-colors">Produits</a>
            <span class="text-muted-foreground">/</span>
            <span class="text-foreground font-medium">{{ product.name }}</span>
        </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <!-- Product Image Section -->
            <div class="space-y-4">
              <!-- Main Image -->
              <div class="aspect-square bg-muted rounded-2xl overflow-hidden shadow-lg group relative">
              <img
                [src]="product.image"
                [alt]="product.name"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                (error)="onImageError($event)"
              />
              @if (product.badge) {
                  <div class="absolute top-4 left-4">
                    <span class="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold shadow-lg">
                  {{ product.badge }}
                </span>
                  </div>
                }
                <!-- Stock Badge -->
                @if (product.stock !== undefined && product.stock !== null) {
                  <div class="absolute top-4 right-4">
                    @if (product.stock > 10) {
                      <span class="inline-block bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg">
                        ✓ En stock
                      </span>
                    } @else if (product.stock > 0) {
                      <span class="inline-block bg-orange-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg">
                        ⚠ Plus que {{ product.stock }} disponible{{ product.stock > 1 ? 's' : '' }}
                      </span>
                    } @else {
                      <span class="inline-block bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg">
                        ✗ Rupture de stock
                      </span>
                    }
                  </div>
                }
              </div>
              
              <!-- Additional Info Cards -->
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-card border border-border rounded-xl p-4 text-center">
                  <div class="text-2xl mb-2">🚚</div>
                  <p class="text-xs text-muted-foreground">Livraison</p>
                  <p class="text-sm font-semibold text-foreground">Gratuite</p>
                </div>
                <div class="bg-card border border-border rounded-xl p-4 text-center">
                  <div class="text-2xl mb-2">↩️</div>
                  <p class="text-xs text-muted-foreground">Retour</p>
                  <p class="text-sm font-semibold text-foreground">30 jours</p>
                </div>
                <div class="bg-card border border-border rounded-xl p-4 text-center">
                  <div class="text-2xl mb-2">🔒</div>
                  <p class="text-xs text-muted-foreground">Paiement</p>
                  <p class="text-sm font-semibold text-foreground">Sécurisé</p>
                </div>
              </div>
            </div>

            <!-- Product Details Section -->
            <div class="space-y-6">
              <!-- Title and Rating -->
              <div>
                <h1 class="text-4xl font-bold text-foreground mb-4 leading-tight">{{ product.name }}</h1>
              
              <!-- Rating -->
                <div class="flex items-center gap-3 mb-4">
                  <div class="flex items-center gap-1">
                  @for (star of [1,2,3,4,5]; track star) {
                      <span class="text-xl">{{ star <= (product.rating || 0) ? '⭐' : '☆' }}</span>
                  }
                </div>
                  <span class="text-lg font-semibold text-foreground">{{ (product.rating || 0).toFixed(1) }}</span>
                  <span class="text-muted-foreground">({{ product.reviews || 0 }} avis)</span>
                </div>
              </div>

              <!-- Price Section -->
              <div class="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6 border border-primary/20">
                <div class="flex items-baseline gap-3">
                  <span class="text-5xl font-bold text-primary">{{ product.price.toFixed(2) }}</span>
                  <span class="text-2xl text-muted-foreground">MAD</span>
                </div>
                @if (product.stock !== undefined && product.stock !== null && product.stock > 0) {
                  <p class="text-sm text-muted-foreground mt-2">
                    {{ product.stock }} disponible{{ product.stock > 1 ? 's' : '' }} en stock
                  </p>
                }
              </div>

              <!-- Description -->
              <div class="prose prose-sm max-w-none">
                <h3 class="text-lg font-semibold text-foreground mb-3">Description</h3>
                <p class="text-muted-foreground leading-relaxed text-base">
                  {{ product.description || 'Découvrez ce produit exceptionnel, conçu avec les meilleurs matériaux et une attention particulière aux détails. Parfait pour votre quotidien. Offrant une qualité premium et une durabilité à toute épreuve, ce produit répondra à tous vos besoins.' }}
                </p>
              </div>

              <!-- Product Info -->
              <div class="bg-muted/50 rounded-xl p-6 space-y-4">
                <h3 class="text-lg font-semibold text-foreground mb-4">Informations produit</h3>
                <div class="grid grid-cols-2 gap-4">
                  @if (product.categoryId) {
                    <div>
                      <p class="text-xs text-muted-foreground mb-1">Catégorie</p>
                      <p class="text-sm font-medium text-foreground">Catégorie #{{ product.categoryId }}</p>
                    </div>
                  }
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">Vendeur</p>
                    <p class="text-sm font-medium text-foreground">ALLAMI SHOP</p>
                  </div>
                  @if (product.stock !== undefined && product.stock !== null) {
                    <div>
                      <p class="text-xs text-muted-foreground mb-1">Stock</p>
                      <p class="text-sm font-medium" [class]="product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'">
                        {{ product.stock }} unité{{ product.stock > 1 ? 's' : '' }}
                      </p>
                    </div>
                  }
                  <div>
                    <p class="text-xs text-muted-foreground mb-1">Référence</p>
                    <p class="text-sm font-medium text-foreground">#{{ product.id }}</p>
                  </div>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="space-y-4">
              <div class="flex gap-4">
                <button
                  (click)="addToCart()"
                    [disabled]="product.stock !== undefined && product.stock !== null && product.stock === 0"
                    class="flex-1 h-14 px-6 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center gap-3 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
                >
                    <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                    {{ (product.stock !== undefined && product.stock !== null && product.stock === 0) ? 'Rupture de stock' : 'Ajouter au panier' }}
                </button>
                  <button 
                    (click)="toggleWishlist()"
                    class="h-14 w-14 rounded-xl border-2 border-border bg-transparent hover:bg-accent inline-flex items-center justify-center transition-all hover:scale-105"
                    [ngClass]="isInWishlist ? 'border-primary bg-primary/10' : ''"
                  >
                    <svg
                      class="w-6 h-6"
                      [ngClass]="isInWishlist ? 'fill-primary text-primary' : ''"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                </div>

                <!-- Added to cart notification -->
                @if (addedToCart) {
                  <div class="p-4 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 text-green-800 dark:text-green-200 rounded-xl flex items-center gap-3 animate-pulse shadow-lg">
                    <svg class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <div>
                      <p class="font-semibold">Produit ajouté au panier !</p>
                      <p class="text-sm">Vous pouvez continuer vos achats ou passer à la caisse.</p>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Similar Products Section - AI Powered -->
          <section class="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div class="flex items-center gap-3 mb-6">
              <span class="text-2xl">🔗</span>
              <h2 class="text-2xl font-bold text-foreground">Produits similaires</h2>
              <span class="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
                🤖 IA
              </span>
          </div>
            
            <app-recommendations 
              type="similar" 
              [productId]="product.id"
              [limit]="5"
              [title]="''"
              [subtitle]="''">
            </app-recommendations>
          </section>
        }
      </main>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private router = inject(Router);

  product: Product | undefined;
  addedToCart = false;
  isLoading = true;
  notFound = false;
  isInWishlist = false;

  ngOnInit(): void {
    this.loadProduct();
  }

  async loadProduct(): Promise<void> {
    this.isLoading = true;
    this.notFound = false;
    
    try {
    const id = Number(this.route.snapshot.paramMap.get('id'));
      
      if (!id || isNaN(id)) {
        console.error('Invalid product ID:', id);
        this.notFound = true;
        this.isLoading = false;
        return;
      }

      console.log('🔍 Loading product with ID:', id);
      
      const product = await this.productService.getProductByIdAsync(id);
      
      if (product) {
        this.product = product;
        console.log('✅ Product loaded:', product.name);
      } else {
        const syncProduct = this.productService.getProductById(id);
        if (syncProduct) {
          this.product = syncProduct;
          console.log('✅ Product loaded (sync):', syncProduct.name);
        } else {
          console.warn('⚠️ Product not found with ID:', id);
          this.notFound = true;
        }
      }
    } catch (error) {
      console.error('❌ Error loading product:', error);
      this.notFound = true;
    } finally {
      this.isLoading = false;
    }
  }

  addToCart(): void {
    if (this.product) {
      if (this.product.stock !== undefined && this.product.stock !== null && this.product.stock === 0) {
        alert('Ce produit est actuellement en rupture de stock.');
        return;
      }
      
      this.cartService.addToCart(this.product);
      this.addedToCart = true;
      setTimeout(() => this.addedToCart = false, 4000);
    }
  }

  toggleWishlist(): void {
    this.isInWishlist = !this.isInWishlist;
    if (this.isInWishlist) {
      console.log('Added to wishlist:', this.product?.name);
    } else {
      console.log('Removed from wishlist:', this.product?.name);
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=800&fit=crop&q=80';
  }
}

