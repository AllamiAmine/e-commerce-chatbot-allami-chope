import { Component, OnInit, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecommendationService } from '../../services/recommendation.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-recommendations',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section *ngIf="products.length > 0 || loading" class="recommendations-section py-8 px-4">
      <div class="max-w-7xl mx-auto">
        <!-- Header -->
        <div *ngIf="title" class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {{ title }}
            </h2>
            <p *ngIf="subtitle" class="mt-1 text-gray-500 dark:text-gray-400">
              {{ subtitle }}
            </p>
          </div>
          
          <!-- Strategy badge -->
          <span *ngIf="showStrategy && strategy" 
                class="px-3 py-1 text-xs font-medium rounded-full"
                [ngClass]="{
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200': strategy === 'collaborative_filtering',
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200': strategy === 'popularity',
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': strategy === 'item_similarity'
                }">
            {{ getStrategyLabel() }}
          </span>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex justify-center py-12">
          <div class="flex flex-col items-center gap-4">
            <div class="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
            <p class="text-gray-500 dark:text-gray-400">Chargement des recommandations IA...</p>
          </div>
        </div>

        <!-- Products Grid -->
        <div *ngIf="!loading && products.length > 0" 
             class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          <div *ngFor="let product of products; trackBy: trackByProductId" 
               class="group relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            
            <!-- Product Image -->
            <a [routerLink]="['/product', product.id]" class="block aspect-square overflow-hidden">
              <img [src]="product.image || 'assets/placeholder.jpg'" 
                   [alt]="product.name"
                   class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                   loading="lazy"
                   (error)="onImageError($event)">
              
              <!-- Badge -->
              <span *ngIf="product.badge" 
                    class="absolute top-3 left-3 px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg">
                {{ product.badge }}
              </span>

              <!-- AI Badge -->
              <span class="absolute top-3 right-3 px-2 py-1 text-xs font-medium rounded-full bg-purple-500/90 text-white backdrop-blur-sm">
                🤖 IA
              </span>
            </a>

            <!-- Product Info -->
            <div class="p-4">
              <!-- Name -->
              <a [routerLink]="['/product', product.id]" 
                 class="block text-sm font-medium text-gray-900 dark:text-white hover:text-orange-500 line-clamp-2 min-h-[2.5rem]">
                {{ product.name }}
              </a>

              <!-- Rating -->
              <div class="flex items-center gap-1 mt-2">
                <div class="flex text-yellow-400">
                  <svg *ngFor="let star of [1,2,3,4,5]" 
                       class="w-3.5 h-3.5" 
                       [class.text-gray-300]="star > (product.rating || 0)"
                       fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                </div>
                <span class="text-xs text-gray-500 dark:text-gray-400">
                  ({{ product.reviews || 0 }})
                </span>
              </div>

              <!-- Price -->
              <div class="mt-3 flex items-center justify-between">
                <span class="text-lg font-bold text-gray-900 dark:text-white">
                  {{ product.price | number:'1.2-2' }} MAD
                </span>
                
                <!-- Add to Cart Button -->
                <button (click)="addToCart(product, $event)"
                        class="p-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all hover:scale-110">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && products.length === 0" class="text-center py-12">
          <p class="text-gray-500 dark:text-gray-400">Aucune recommandation disponible pour le moment.</p>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class RecommendationsComponent implements OnInit {
  @Input() type: 'user' | 'popular' | 'similar' = 'popular';
  @Input() productId?: number;
  @Input() limit: number = 10;
  @Input() title: string = 'Recommandé pour vous';
  @Input() subtitle: string = 'Découvrez des produits qui pourraient vous plaire';
  @Input() showStrategy: boolean = false;

  private recommendationService = inject(RecommendationService);
  private productService = inject(ProductService);
  private authService = inject(AuthService);
  private cartService = inject(CartService);

  products: Product[] = [];
  loading: boolean = true;
  strategy: string = '';

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.loading = true;

    switch (this.type) {
      case 'user':
        this.loadUserRecommendations();
        break;
      case 'similar':
        this.loadSimilarProducts();
        break;
      case 'popular':
      default:
        this.loadPopularProducts();
        break;
    }
  }

  private loadUserRecommendations(): void {
    const user = this.authService.user();
    
    if (!user?.id) {
      // Fallback to popular products for guests
      this.loadPopularProducts();
      return;
    }

    this.recommendationService.getRecommendationsForUser(user.id, this.limit)
      .subscribe({
        next: (response) => {
          this.strategy = response.strategy_used;
          // Use local products as the AI model has synthetic IDs
          // In production, you'd map these to real product IDs
          this.products = this.getRandomProducts(this.limit);
          this.loading = false;
        },
        error: () => {
          this.loadPopularProducts();
        }
      });
  }

  private loadSimilarProducts(): void {
    if (!this.productId) {
      this.loading = false;
      return;
    }

    this.recommendationService.getSimilarProducts(this.productId, this.limit)
      .subscribe({
        next: (response) => {
          this.strategy = 'item_similarity';
          // Use local products - get products from same category
          const currentProduct = this.productService.getProductById(this.productId!);
          if (currentProduct?.categoryId) {
            this.products = this.productService.getProductsByCategory(currentProduct.categoryId)
              .filter(p => p.id !== this.productId)
              .slice(0, this.limit);
          } else {
            this.products = this.getRandomProducts(this.limit, this.productId);
          }
          this.loading = false;
        },
        error: () => {
          // Fallback to category-based similarity
          const currentProduct = this.productService.getProductById(this.productId!);
          if (currentProduct?.categoryId) {
            this.products = this.productService.getProductsByCategory(currentProduct.categoryId)
              .filter(p => p.id !== this.productId)
              .slice(0, this.limit);
          } else {
            this.products = this.getRandomProducts(this.limit, this.productId);
          }
          this.loading = false;
        }
      });
  }

  private loadPopularProducts(): void {
    this.strategy = 'popularity';
    
    this.recommendationService.getPopularProducts(this.limit)
      .subscribe({
        next: () => {
          // Use top-rated products from local service as "popular"
          this.products = this.productService.getTopRatedProducts(this.limit);
          this.loading = false;
        },
        error: () => {
          // Fallback to top-rated
          this.products = this.productService.getTopRatedProducts(this.limit);
          this.loading = false;
        }
      });
  }

  private getRandomProducts(count: number, excludeId?: number): Product[] {
    const allProducts = this.productService.getProducts();
    const filtered = excludeId 
      ? allProducts.filter(p => p.id !== excludeId)
      : allProducts;
    
    // Shuffle and take first 'count' products
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  getStrategyLabel(): string {
    switch (this.strategy) {
      case 'collaborative_filtering':
        return '🤖 IA Personnalisée';
      case 'item_similarity':
        return '🔗 Produits similaires';
      case 'popularity':
        return '🔥 Tendances';
      default:
        return this.strategy;
    }
  }

  addToCart(product: Product, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cartService.addToCart(product);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=800&fit=crop&q=80';
  }

  trackByProductId(index: number, product: Product): number {
    return product.id;
  }
}

