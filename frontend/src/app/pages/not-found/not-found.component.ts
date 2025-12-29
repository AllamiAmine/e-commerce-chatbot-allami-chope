import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex items-center justify-center p-4">
      <!-- Background Effects -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
      </div>

      <div class="relative text-center max-w-lg">
        <!-- 404 Animation -->
        <div class="relative mb-8">
          <div class="text-[180px] md:text-[220px] font-black text-transparent bg-clip-text bg-gradient-to-br from-primary via-accent to-primary leading-none select-none">
            404
          </div>
          <div class="absolute inset-0 text-[180px] md:text-[220px] font-black text-primary/5 blur-2xl leading-none select-none">
            404
          </div>
          
          <!-- Animated Elements -->
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32">
            <div class="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-20 h-20 rounded-full bg-card border-4 border-border flex items-center justify-center shadow-2xl">
                <span class="text-4xl">🔍</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Message -->
        <h1 class="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Oups ! Page introuvable
        </h1>
        <p class="text-lg text-muted-foreground mb-8 leading-relaxed">
          La page que vous recherchez semble avoir disparu dans le cyberespace. 
          Peut-être a-t-elle été déplacée ou n'existe plus.
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <a 
            routerLink="/" 
            class="px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-primary/25 flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
            </svg>
            Retour à l'accueil
          </a>
          <a 
            routerLink="/categories" 
            class="px-8 py-4 border-2 border-border rounded-2xl font-semibold text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
            </svg>
            Parcourir les produits
          </a>
        </div>

        <!-- Helpful Links -->
        <div class="mt-12 pt-8 border-t border-border">
          <p class="text-sm text-muted-foreground mb-4">Liens utiles :</p>
          <div class="flex flex-wrap justify-center gap-4">
            <a routerLink="/" class="text-sm text-primary hover:underline">Accueil</a>
            <span class="text-muted-foreground">•</span>
            <a routerLink="/categories" class="text-sm text-primary hover:underline">Catégories</a>
            <span class="text-muted-foreground">•</span>
            <a routerLink="/cart" class="text-sm text-primary hover:underline">Panier</a>
            <span class="text-muted-foreground">•</span>
            <a routerLink="/contact" class="text-sm text-primary hover:underline">Contact</a>
          </div>
        </div>

        <!-- Fun Fact -->
        <div class="mt-8 p-4 bg-muted/50 rounded-2xl border border-border">
          <p class="text-sm text-muted-foreground flex items-center justify-center gap-2">
            <span>💡</span>
            <span>Le saviez-vous ? Le code 404 a été créé au CERN en 1992 !</span>
          </p>
        </div>
      </div>
    </div>
  `
})
export class NotFoundComponent {}


