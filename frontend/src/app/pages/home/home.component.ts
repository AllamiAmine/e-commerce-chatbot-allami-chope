import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { ProductsComponent } from '../../components/products/products.component';
import { AboutComponent } from '../../components/about/about.component';
import { RecommendationsComponent } from '../../components/recommendations/recommendations.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    HeaderComponent, 
    HeroComponent, 
    ProductsComponent, 
    AboutComponent,
    RecommendationsComponent
  ],
  template: `
    <main class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <app-header></app-header>
      <app-hero></app-hero>
      
      <!-- AI Recommendations Section -->
      <section class="py-12 bg-gradient-to-b from-orange-50 to-white dark:from-gray-800 dark:to-gray-900">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">🤖</span>
            <h2 class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {{ authService.isLoggedIn() ? 'Recommandé pour vous' : 'Tendances du moment' }}
            </h2>
            <span class="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full">
              Powered by AI
            </span>
          </div>
          <p class="text-gray-500 dark:text-gray-400 mb-8">
            {{ authService.isLoggedIn() ? 'Sélection personnalisée par notre intelligence artificielle' : 'Les produits les plus populaires du moment' }}
          </p>
        </div>
        
        <app-recommendations 
          [type]="authService.isLoggedIn() ? 'user' : 'popular'" 
          [limit]="10"
          [title]="''"
          [subtitle]="''">
        </app-recommendations>
      </section>
      
      <app-products></app-products>
      
      <!-- Services Section -->
      <section id="services" class="py-16 bg-gradient-to-b from-background to-muted/30 scroll-mt-20">
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Nos Services
            </h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez tous les services que nous proposons pour améliorer votre expérience d'achat
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <!-- Service 1: AI Recommendations -->
            <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-foreground mb-2">Recommandations IA</h3>
              <p class="text-muted-foreground mb-4">
                Notre intelligence artificielle analyse vos préférences pour vous proposer des produits personnalisés adaptés à vos besoins.
              </p>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Analyse de vos préférences
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Suggestions en temps réel
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Produits similaires intelligents
                </li>
              </ul>
            </div>

            <!-- Service 2: Chatbot Assistant -->
            <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-foreground mb-2">Assistant Chatbot</h3>
              <p class="text-muted-foreground mb-4">
                Chattez avec notre assistant IA disponible 24/7 pour obtenir de l'aide, des recommandations et des réponses à vos questions.
              </p>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Disponible 24/7
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Traitement du langage naturel
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Recherche intelligente de produits
                </li>
              </ul>
            </div>

            <!-- Service 3: Fast Delivery -->
            <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-foreground mb-2">Livraison Rapide</h3>
              <p class="text-muted-foreground mb-4">
                Livraison express dans tout le Maroc avec suivi en temps réel de votre commande jusqu'à votre porte.
              </p>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Livraison 24-48h
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Suivi en temps réel
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Livraison gratuite dès 500 MAD
                </li>
              </ul>
            </div>

            <!-- Service 4: Secure Payment -->
            <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-foreground mb-2">Paiement Sécurisé</h3>
              <p class="text-muted-foreground mb-4">
                Transactions 100% sécurisées avec cryptage SSL et support de multiples méthodes de paiement.
              </p>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Cryptage SSL 256 bits
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Carte bancaire, PayPal, CIB
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Paiement à la livraison
                </li>
              </ul>
            </div>

            <!-- Service 5: Customer Support -->
            <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-foreground mb-2">Support Client</h3>
              <p class="text-muted-foreground mb-4">
                Équipe dédiée disponible pour répondre à toutes vos questions et vous accompagner dans vos achats.
              </p>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Réponse sous 24h
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Chat, email, téléphone
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Guide d'achat et FAQ
                </li>
              </ul>
            </div>

            <!-- Service 6: Returns & Exchanges -->
            <div class="bg-card border border-border rounded-2xl p-6 hover:shadow-xl transition-all hover:-translate-y-1">
              <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4">
                <svg class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                </svg>
              </div>
              <h3 class="text-xl font-bold text-foreground mb-2">Retours & Échanges</h3>
              <p class="text-muted-foreground mb-4">
                Politique de retour flexible : 30 jours pour changer d'avis, échanges gratuits et remboursement garanti.
              </p>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Retour sous 30 jours
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Échanges gratuits
                </li>
                <li class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Remboursement garanti
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
      
      <!-- Deals Section -->
      <section id="deals" class="py-16 bg-gradient-to-br from-primary/10 via-accent/5 to-background scroll-mt-20">
        <div class="max-w-7xl mx-auto px-4 md:px-6">
          <div class="text-center mb-12">
            <h2 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
              🔥 Offres Spéciales
            </h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Profitez de nos meilleures promotions et offres limitées
            </p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Deal 1 -->
            <div class="bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div class="relative z-10">
                <div class="text-4xl mb-4">🎉</div>
                <h3 class="text-2xl font-bold mb-2">Nouveaux Clients</h3>
                <p class="text-white/90 mb-4">-20% sur votre première commande</p>
                <div class="text-3xl font-bold mb-2">20% OFF</div>
                <p class="text-sm text-white/80">Code: WELCOME20</p>
              </div>
            </div>

            <!-- Deal 2 -->
            <div class="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div class="relative z-10">
                <div class="text-4xl mb-4">🚀</div>
                <h3 class="text-2xl font-bold mb-2">Livraison Gratuite</h3>
                <p class="text-white/90 mb-4">Pour toute commande supérieure à 500 MAD</p>
                <div class="text-3xl font-bold mb-2">GRATUIT</div>
                <p class="text-sm text-white/80">Valable partout au Maroc</p>
              </div>
            </div>

            <!-- Deal 3 -->
            <div class="bg-gradient-to-br from-orange-500 to-yellow-600 rounded-2xl p-8 text-white relative overflow-hidden">
              <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
              <div class="relative z-10">
                <div class="text-4xl mb-4">💎</div>
                <h3 class="text-2xl font-bold mb-2">Programme Fidélité</h3>
                <p class="text-white/90 mb-4">Gagnez des points à chaque achat</p>
                <div class="text-3xl font-bold mb-2">1%</div>
                <p class="text-sm text-white/80">Cashback sur tous vos achats</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <app-about></app-about>
    </main>
  `
})
export class HomeComponent {
  authService = inject(AuthService);
}

