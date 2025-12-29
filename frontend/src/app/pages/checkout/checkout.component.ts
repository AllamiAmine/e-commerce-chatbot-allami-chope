import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';

interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PaymentInfo {
  method: 'card' | 'paypal' | 'cod';
  cardNumber: string;
  cardExpiry: string;
  cardCvc: string;
  cardName: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header></app-header>
      
      <main class="container mx-auto px-4 md:px-6 py-8">
        <!-- Empty Cart Message -->
        @if (isEmpty()) {
          <div class="max-w-2xl mx-auto mt-12">
            <div class="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
              <div class="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center text-4xl">
                🛒
              </div>
              <h2 class="text-2xl font-bold text-foreground mb-3">Votre panier est vide</h2>
              <p class="text-muted-foreground mb-6">
                Vous devez ajouter des produits à votre panier avant de procéder au checkout.
              </p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <a routerLink="/categories" class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
                  </svg>
                  Parcourir les produits
                </a>
                <a routerLink="/cart" class="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors inline-flex items-center justify-center gap-2">
                  Voir mon panier
                </a>
              </div>
              <p class="text-xs text-muted-foreground mt-6">
                Redirection automatique vers le panier dans 2 secondes...
              </p>
            </div>
          </div>
        } @else {
        <!-- Progress Steps -->
        <div class="flex items-center justify-center mb-12">
          <div class="flex items-center">
            @for (step of steps; track step.id; let i = $index) {
              <div class="flex items-center">
                <div 
                  [class]="'flex items-center justify-center w-10 h-10 rounded-full font-semibold transition-all ' + 
                    (currentStep() >= step.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground')"
                >
                  @if (currentStep() > step.id) {
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  } @else {
                    {{ step.id }}
                  }
                </div>
                <span [class]="'ml-2 text-sm font-medium hidden sm:inline ' + 
                  (currentStep() >= step.id ? 'text-foreground' : 'text-muted-foreground')">
                  {{ step.label }}
                </span>
                @if (i < steps.length - 1) {
                  <div [class]="'w-12 sm:w-24 h-1 mx-4 rounded ' + 
                    (currentStep() > step.id ? 'bg-primary' : 'bg-muted')"></div>
                }
              </div>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Form Section -->
          <div class="lg:col-span-2">
            <!-- Step 1: Shipping -->
            @if (currentStep() === 1) {
              <div class="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">📦</span>
                  Informations de livraison
                </h2>
                
                <form class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Nom complet *</label>
                      <input
                        type="text"
                        [(ngModel)]="shipping.fullName"
                        name="fullName"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Votre nom complet"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Email *</label>
                      <input
                        type="email"
                        [(ngModel)]="shipping.email"
                        name="email"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="votre@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Téléphone *</label>
                      <input
                        type="tel"
                        [(ngModel)]="shipping.phone"
                        name="phone"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="+212 6XX XXX XXX"
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Pays</label>
                      <select
                        [(ngModel)]="shipping.country"
                        name="country"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="MA">Maroc 🇲🇦</option>
                        <option value="FR">France 🇫🇷</option>
                        <option value="BE">Belgique 🇧🇪</option>
                        <option value="CH">Suisse 🇨🇭</option>
                        <option value="CA">Canada 🇨🇦</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2">Adresse de livraison *</label>
                    <input
                      type="text"
                      [(ngModel)]="shipping.address"
                      name="address"
                      class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Numéro, rue, quartier..."
                      required
                    />
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Ville *</label>
                      <input
                        type="text"
                        [(ngModel)]="shipping.city"
                        name="city"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Casablanca, Rabat..."
                        required
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Code postal</label>
                      <input
                        type="text"
                        [(ngModel)]="shipping.postalCode"
                        name="postalCode"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="20000"
                      />
                    </div>
                  </div>

                  <!-- Shipping Options -->
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-4">Mode de livraison</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      @for (option of shippingOptions; track option.id) {
                        <button
                          type="button"
                          (click)="selectedShipping.set(option.id)"
                          [class]="'flex items-start gap-4 p-4 border-2 rounded-xl transition-all text-left ' +
                            (selectedShipping() === option.id 
                              ? 'border-primary bg-primary/5' 
                              : 'border-border hover:border-primary/50')"
                        >
                          <span class="text-2xl">{{ option.icon }}</span>
                          <div class="flex-1">
                            <div class="flex items-center justify-between">
                              <span class="font-semibold text-foreground">{{ option.name }}</span>
                              <span class="text-primary font-bold">{{ option.price }} MAD</span>
                            </div>
                            <p class="text-sm text-muted-foreground mt-1">{{ option.delay }}</p>
                          </div>
                        </button>
                      }
                    </div>
                  </div>
                </form>
              </div>
            }

            <!-- Step 2: Payment -->
            @if (currentStep() === 2) {
              <div class="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">💳</span>
                  Mode de paiement
                </h2>

                <!-- Payment Methods -->
                <div class="space-y-4 mb-8">
                  @for (method of paymentMethods; track method.id) {
                    <button
                      type="button"
                      (click)="payment.method = method.id"
                      [class]="'w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all text-left ' +
                        (payment.method === method.id 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50')"
                    >
                      <span class="text-3xl">{{ method.icon }}</span>
                      <div class="flex-1">
                        <span class="font-semibold text-foreground">{{ method.name }}</span>
                        <p class="text-sm text-muted-foreground">{{ method.description }}</p>
                      </div>
                      <div [class]="'w-5 h-5 rounded-full border-2 flex items-center justify-center ' +
                        (payment.method === method.id ? 'border-primary' : 'border-muted')">
                        @if (payment.method === method.id) {
                          <div class="w-3 h-3 rounded-full bg-primary"></div>
                        }
                      </div>
                    </button>
                  }
                </div>

                <!-- Card Form -->
                @if (payment.method === 'card') {
                  <div class="border-t border-border pt-6 space-y-6">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Nom sur la carte</label>
                      <input
                        type="text"
                        [(ngModel)]="payment.cardName"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="PRÉNOM NOM"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Numéro de carte</label>
                      <div class="relative">
                        <input
                          type="text"
                          [(ngModel)]="payment.cardNumber"
                          (input)="formatCardNumber($event)"
                          class="w-full px-4 py-3 pr-16 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="4242 4242 4242 4242"
                          maxlength="19"
                        />
                        <div class="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                          <svg class="w-8 h-5 text-blue-600" viewBox="0 0 24 24"><rect fill="currentColor" rx="2" width="24" height="16" y="4"/></svg>
                        </div>
                      </div>
                    </div>
                    <div class="grid grid-cols-2 gap-6">
                      <div>
                        <label class="block text-sm font-medium text-foreground mb-2">Date d'expiration</label>
                        <input
                          type="text"
                          [(ngModel)]="payment.cardExpiry"
                          (input)="formatExpiry($event)"
                          class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="MM/AA"
                          maxlength="5"
                        />
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-foreground mb-2">CVC</label>
                        <input
                          type="text"
                          [(ngModel)]="payment.cardCvc"
                          (input)="formatCvc($event)"
                          class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder="123"
                          maxlength="4"
                        />
                      </div>
                    </div>
                  </div>
                }

                @if (payment.method === 'cod') {
                  <div class="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                    <span class="text-2xl">💵</span>
                    <div>
                      <p class="text-sm text-amber-800 font-medium">Paiement à la livraison</p>
                      <p class="text-sm text-amber-600 mt-1">Vous paierez en espèces au livreur. Frais supplémentaires de 20 MAD.</p>
                    </div>
                  </div>
                }
              </div>
            }

            <!-- Step 3: Confirmation -->
            @if (currentStep() === 3) {
              <div class="bg-card border border-border rounded-2xl p-6 md:p-8">
                <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span class="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">✓</span>
                  Confirmation de commande
                </h2>

                <!-- Order Items -->
                <div class="space-y-4 mb-8">
                  <h3 class="font-semibold text-foreground">Articles commandés</h3>
                  @for (item of cartService.cartItems(); track item.product.id) {
                    <div class="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                      <img 
                        [src]="item.product.image" 
                        [alt]="item.product.name" 
                        class="w-16 h-16 object-cover rounded-lg" 
                        loading="lazy"
                        decoding="async"
                        (error)="onImageError($event)" 
                      />
                      <div class="flex-1">
                        <p class="font-medium text-foreground">{{ item.product.name }}</p>
                        <p class="text-sm text-muted-foreground">Quantité: {{ item.quantity }}</p>
                      </div>
                      <p class="font-bold text-primary">{{ (item.product.price * item.quantity).toFixed(2) }} MAD</p>
                    </div>
                  }
                </div>

                <!-- Shipping Info Summary -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div class="p-4 border border-border rounded-xl">
                    <h3 class="font-semibold text-foreground mb-3 flex items-center gap-2">
                      📦 Adresse de livraison
                    </h3>
                    <p class="text-sm text-muted-foreground">{{ shipping.fullName }}</p>
                    <p class="text-sm text-muted-foreground">{{ shipping.address }}</p>
                    <p class="text-sm text-muted-foreground">{{ shipping.postalCode }} {{ shipping.city }}</p>
                    <p class="text-sm text-muted-foreground">{{ shipping.phone }}</p>
                  </div>
                  <div class="p-4 border border-border rounded-xl">
                    <h3 class="font-semibold text-foreground mb-3 flex items-center gap-2">
                      💳 Mode de paiement
                    </h3>
                    <p class="text-sm text-muted-foreground">
                      {{ getPaymentMethodName() }}
                    </p>
                    @if (payment.method === 'card') {
                      <p class="text-sm text-muted-foreground">
                        **** **** **** {{ payment.cardNumber.slice(-4) }}
                      </p>
                    }
                  </div>
                </div>

                <!-- Terms -->
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="acceptTerms"
                    class="w-5 h-5 mt-0.5 rounded border-border text-primary focus:ring-primary accent-primary"
                  />
                  <span class="text-sm text-muted-foreground">
                    J'accepte les <a href="#" class="text-primary hover:underline">conditions générales de vente</a>
                    et la <a href="#" class="text-primary hover:underline">politique de confidentialité</a>
                  </span>
                </label>
              </div>
            }

            <!-- Step 4: Success -->
            @if (currentStep() === 4) {
              <div class="bg-card border border-border rounded-2xl p-8 md:p-12 text-center">
                <div class="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <svg class="w-12 h-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                </div>
                <h2 class="text-3xl font-bold text-foreground mb-3">Commande confirmée ! 🎉</h2>
                <p class="text-muted-foreground mb-6 max-w-md mx-auto">
                  Merci pour votre commande. Un email de confirmation a été envoyé à <strong>{{ shipping.email }}</strong>
                </p>
                <div class="bg-muted/50 rounded-xl p-4 mb-8 inline-block">
                  <p class="text-sm text-muted-foreground">Numéro de commande</p>
                  <p class="text-2xl font-bold text-primary">{{ orderNumber }}</p>
                </div>
                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                  <a routerLink="/orders" class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors inline-flex items-center justify-center gap-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                    </svg>
                    Suivre ma commande
                  </a>
                  <a routerLink="/" class="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors inline-flex items-center justify-center gap-2">
                    Continuer mes achats
                  </a>
                </div>
              </div>
            }

            <!-- Navigation Buttons -->
            @if (currentStep() < 4) {
              <div class="flex justify-between mt-8">
                <button
                  (click)="previousStep()"
                  [disabled]="currentStep() === 1"
                  class="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  Précédent
                </button>
                <button
                  (click)="nextStep()"
                  [disabled]="!canProceed()"
                  class="px-8 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {{ currentStep() === 3 ? 'Confirmer la commande' : 'Continuer' }}
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </button>
              </div>
            }
          </div>

          <!-- Order Summary -->
          @if (currentStep() < 4) {
            <div class="lg:col-span-1">
              <div class="bg-card border border-border rounded-2xl p-6 sticky top-24">
                <h2 class="text-xl font-bold mb-6">Résumé de la commande</h2>

                <!-- Items -->
                <div class="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  @for (item of cartService.cartItems(); track item.product.id) {
                    <div class="flex items-center gap-3">
                      <div class="relative">
                        <img 
                          [src]="item.product.image" 
                          [alt]="item.product.name" 
                          class="w-14 h-14 object-cover rounded-lg" 
                          loading="lazy"
                          decoding="async"
                          (error)="onImageError($event)" 
                        />
                        <span class="absolute -top-2 -right-2 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                          {{ item.quantity }}
                        </span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-foreground truncate">{{ item.product.name }}</p>
                        <p class="text-xs text-muted-foreground">{{ item.product.price.toFixed(2) }} MAD</p>
                      </div>
                      <p class="text-sm font-semibold text-foreground">{{ (item.product.price * item.quantity).toFixed(2) }} MAD</p>
                    </div>
                  }
                </div>

                <!-- Promo Code -->
                <div class="mb-6">
                  @if (appliedPromo()) {
                    <div class="mb-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        <span class="text-sm font-medium text-green-800 dark:text-green-200">Code {{ appliedPromo() }} appliqué (-{{ promoDiscount() }} MAD)</span>
                      </div>
                      <button 
                        type="button"
                        (click)="removePromoCode()"
                        class="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                        title="Retirer le code promo"
                      >
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                      </button>
                    </div>
                  }
                  <div class="flex gap-2">
                    <input
                      type="text"
                      [(ngModel)]="promoCode"
                      [placeholder]="appliedPromo() ? 'Autre code promo' : 'Code promo'"
                      [disabled]="!!appliedPromo()"
                      class="flex-1 px-4 py-2 border border-input rounded-xl bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button 
                      type="button"
                      (click)="applyPromoCode()"
                      [disabled]="!!appliedPromo() || !promoCode.trim()"
                      class="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                      Appliquer
                    </button>
                  </div>
                </div>

                <!-- Totals -->
                <div class="space-y-3 pt-4 border-t border-border">
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Sous-total</span>
                    <span class="font-semibold">{{ cartService.subtotal().toFixed(2) }} MAD</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">Livraison</span>
                    <span class="font-semibold">{{ getShippingCost().toFixed(2) }} MAD</span>
                  </div>
                  @if (payment.method === 'cod') {
                    <div class="flex justify-between text-sm">
                      <span class="text-muted-foreground">Frais paiement à livraison</span>
                      <span class="font-semibold">20.00 MAD</span>
                    </div>
                  }
                  @if (promoDiscount() > 0) {
                    <div class="flex justify-between text-sm text-green-600">
                      <span class="font-medium">Réduction ({{ appliedPromo() }})</span>
                      <span class="font-semibold">-{{ promoDiscount().toFixed(2) }} MAD</span>
                    </div>
                  }
                  <div class="flex justify-between text-sm">
                    <span class="text-muted-foreground">TVA (20%)</span>
                    <span class="font-semibold">{{ getTax().toFixed(2) }} MAD</span>
                  </div>
                </div>

                <div class="flex justify-between items-center mt-6 pt-4 border-t border-border">
                  <span class="font-bold text-foreground">Total</span>
                  <span class="text-2xl font-bold text-primary">{{ getTotal().toFixed(2) }} MAD</span>
                </div>

                <!-- Security Badge -->
                <div class="mt-6 pt-4 border-t border-border">
                  <div class="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    Paiement 100% sécurisé
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
        }
      </main>
    </div>
  `
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentStep = signal(1);
  promoCode = '';
  acceptTerms = false;
  selectedShipping = signal('standard');
  orderNumber = '';
  promoDiscount = signal(0);
  appliedPromo = signal('');

  steps = [
    { id: 1, label: 'Livraison' },
    { id: 2, label: 'Paiement' },
    { id: 3, label: 'Confirmation' },
    { id: 4, label: 'Succès' }
  ];

  shipping: ShippingInfo = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'MA'
  };

  payment: PaymentInfo = {
    method: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: ''
  };

  shippingOptions = [
    { id: 'standard', name: 'Standard', icon: '📦', price: 29, delay: '5-7 jours ouvrés' },
    { id: 'express', name: 'Express', icon: '🚀', price: 59, delay: '2-3 jours ouvrés' },
    { id: 'same-day', name: 'Livraison le jour même', icon: '⚡', price: 99, delay: 'Aujourd\'hui (avant 18h)' },
    { id: 'pickup', name: 'Retrait en magasin', icon: '🏪', price: 0, delay: 'Disponible en 24h' }
  ];

  paymentMethods = [
    { id: 'card' as const, name: 'Carte bancaire', icon: '💳', description: 'Visa, Mastercard, CB' },
    { id: 'paypal' as const, name: 'PayPal', icon: '🅿️', description: 'Paiement sécurisé via PayPal' },
    { id: 'cod' as const, name: 'Paiement à la livraison', icon: '💵', description: '+20 MAD de frais' }
  ];

  isEmpty = signal(false);

  ngOnInit(): void {
    // Check if cart is empty
    if (this.cartService.cartItems().length === 0) {
      this.isEmpty.set(true);
      // Redirect after a short delay to show message
      setTimeout(() => {
        this.router.navigate(['/cart']);
      }, 2000);
      return;
    }

    // Pre-fill with user data if logged in
    const user = this.authService.user();
    if (user) {
      this.shipping.fullName = user.name;
      this.shipping.email = user.email;
      this.shipping.phone = user.phone || '';
    }
  }

  // Use computed signals for better performance
  shippingCost = computed(() => {
    const option = this.shippingOptions.find(o => o.id === this.selectedShipping());
    return option?.price || 0;
  });

  tax = computed(() => this.cartService.subtotal() * 0.2);

  total = computed(() => {
    let total = this.cartService.subtotal() + this.shippingCost() + this.tax();
    if (this.payment.method === 'cod') {
      total += 20;
    }
    total -= this.promoDiscount();
    return Math.max(0, total); // Ensure total is never negative
  });

  // Legacy getters for compatibility (deprecated, use computed signals)
  getShippingCost(): number {
    return this.shippingCost();
  }

  getTax(): number {
    return this.tax();
  }

  getTotal(): number {
    return this.total();
  }

  getPromoDiscount(): number {
    return this.promoDiscount();
  }

  applyPromoCode(): void {
    const codes: Record<string, number> = {
      'WELCOME10': 10,
      'SAVE20': 20,
      'FLASH30': 30,
      'VIP50': 50
    };
    
    const code = this.promoCode.toUpperCase().trim();
    if (codes[code]) {
      this.promoDiscount.set(codes[code]);
      this.appliedPromo.set(code);
      this.promoCode = '';
    } else {
      this.promoDiscount.set(0);
      this.appliedPromo.set('');
      alert('Code promo invalide');
    }
  }

  removePromoCode(): void {
    this.promoDiscount.set(0);
    this.appliedPromo.set('');
    this.promoCode = '';
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove all non-digits
    let value = input.value.replace(/\D/g, '');
    // Limit to 16 digits
    value = value.substring(0, 16);
    // Add spaces every 4 digits
    value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.payment.cardNumber = value;
    input.value = value;
  }

  formatExpiry(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove all non-digits
    let value = input.value.replace(/\D/g, '');
    // Limit to 4 digits
    value = value.substring(0, 4);
    // Add slash after 2 digits
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    this.payment.cardExpiry = value;
    input.value = value;
  }

  formatCvc(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remove all non-digits and limit to 4 digits
    this.payment.cardCvc = input.value.replace(/\D/g, '').substring(0, 4);
    input.value = this.payment.cardCvc;
  }

  getPaymentMethodName(): string {
    const method = this.paymentMethods.find(m => m.id === this.payment.method);
    return method?.name || '';
  }

  canProceed(): boolean {
    if (this.currentStep() === 1) {
      return !!(this.shipping.fullName && this.shipping.email && this.shipping.phone && 
                this.shipping.address && this.shipping.city && this.selectedShipping());
    }
    if (this.currentStep() === 2) {
      if (this.payment.method === 'card') {
        return !!(this.payment.cardNumber && this.payment.cardExpiry && this.payment.cardCvc);
      }
      return true;
    }
    if (this.currentStep() === 3) {
      return this.acceptTerms;
    }
    return true;
  }

  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  nextStep(): void {
    if (this.currentStep() === 3) {
      // Place order
      this.orderNumber = 'SHP-' + Date.now().toString().slice(-8);
      this.cartService.clearCart();
      this.currentStep.set(4);
    } else if (this.currentStep() < 4 && this.canProceed()) {
      this.currentStep.update(s => s + 1);
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200&h=200&fit=crop&q=80';
    img.loading = 'lazy';
  }
}

