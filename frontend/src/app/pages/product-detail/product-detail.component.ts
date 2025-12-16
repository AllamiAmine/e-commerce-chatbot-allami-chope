import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-detail',
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

        @if (product) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Product Image -->
            <div class="aspect-square bg-muted rounded-lg overflow-hidden">
              <img
                [src]="product.image"
                [alt]="product.name"
                class="w-full h-full object-cover"
                (error)="onImageError($event)"
              />
            </div>

            <!-- Product Details -->
            <div>
              @if (product.badge) {
                <span class="inline-block bg-primary text-primary-foreground px-3 py-1 rounded text-sm font-semibold mb-4">
                  {{ product.badge }}
                </span>
              }
              
              <h1 class="text-3xl font-bold text-foreground mb-4">{{ product.name }}</h1>
              
              <!-- Rating -->
              <div class="flex items-center gap-2 mb-4">
                <div class="flex">
                  @for (star of [1,2,3,4,5]; track star) {
                    <span class="text-lg">{{ star <= product.rating ? '⭐' : '☆' }}</span>
                  }
                </div>
                <span class="text-muted-foreground">({{ product.reviews }} avis)</span>
              </div>

              <p class="text-3xl font-bold text-primary mb-6">{{ product.price.toFixed(2) }} MAD</p>

              <p class="text-muted-foreground mb-8">
                Découvrez ce produit exceptionnel, conçu avec les meilleurs matériaux et une attention particulière aux détails. 
                Parfait pour votre quotidien.
              </p>

              <div class="flex gap-4">
                <button
                  (click)="addToCart()"
                  class="flex-1 h-12 px-6 rounded-lg font-medium bg-primary hover:bg-primary/90 text-primary-foreground inline-flex items-center justify-center gap-2"
                >
                  <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Ajouter au panier
                </button>
                <button class="h-12 w-12 rounded-lg border border-input bg-transparent hover:bg-accent inline-flex items-center justify-center">
                  <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        } @else {
          <div class="text-center py-16">
            <h2 class="text-2xl font-semibold mb-4">Produit non trouvé</h2>
            <a routerLink="/" class="text-primary hover:underline">Retour à l'accueil</a>
          </div>
        }
      </main>
    </div>
  `
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);

  product: Product | undefined;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product = this.productService.getProductById(id);
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
    }
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/placeholder.jpg';
  }
}

