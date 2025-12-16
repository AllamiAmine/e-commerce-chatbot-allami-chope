import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-foreground text-background border-t border-border">
      <!-- Main Footer -->
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 py-12">
          <!-- Company Info -->
          <div class="lg:col-span-1">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <span class="font-bold text-xl tracking-wide">allami <span class="text-primary">chope</span></span>
                <span class="block text-xs text-background/60">Premium Mobile Store</span>
              </div>
            </div>
            <p class="text-sm text-background/70 mb-4 leading-relaxed">
              Boutique spécialisée dans les smartphones, laptops et accessoires haut de gamme, avec des offres exclusives toute l'année.
            </p>
            <div class="flex gap-3">
              <a href="#" class="w-9 h-9 rounded-lg bg-background/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="#" class="w-9 h-9 rounded-lg bg-background/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
              </a>
              <a href="#" class="w-9 h-9 rounded-lg bg-background/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </a>
              <a href="#" class="w-9 h-9 rounded-lg bg-background/10 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
            </div>
          </div>

          <!-- Quick Links -->
          <div>
            <h4 class="font-semibold mb-4 text-background">Navigation</h4>
            <ul class="space-y-2">
              <li><a routerLink="/" class="text-sm text-background/70 hover:text-primary transition-colors">Accueil</a></li>
              <li><a routerLink="/categories" class="text-sm text-background/70 hover:text-primary transition-colors">Catégories</a></li>
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">Nouveautés</a></li>
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">Promotions</a></li>
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">Meilleures ventes</a></li>
            </ul>
          </div>

          <!-- Support -->
          <div>
            <h4 class="font-semibold mb-4 text-background">Support & Aide</h4>
            <ul class="space-y-2">
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">Centre d'aide</a></li>
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">FAQ</a></li>
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">Livraison</a></li>
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">Retours & Échanges</a></li>
              <li><a href="#" class="text-sm text-background/70 hover:text-primary transition-colors">Contactez-nous</a></li>
            </ul>
          </div>

          <!-- Technologies -->
          <div>
            <h4 class="font-semibold mb-4 text-background">Technologies</h4>
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm text-background/70">
                <span class="w-2 h-2 rounded-full bg-red-500"></span>
                Angular 18
              </div>
              <div class="flex items-center gap-2 text-sm text-background/70">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                Spring Boot
              </div>
              <div class="flex items-center gap-2 text-sm text-background/70">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                MySQL
              </div>
              <div class="flex items-center gap-2 text-sm text-background/70">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                NLP / Intelligence Artificielle
              </div>
              <div class="flex items-center gap-2 text-sm text-background/70">
                <span class="w-2 h-2 rounded-full bg-cyan-500"></span>
                Architecture Microservices
              </div>
            </div>
          </div>
        </div>

        <!-- PFA Credits -->
        <div class="border-t border-background/10 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="text-center md:text-left">
              <p class="text-sm text-background/70">
                <strong class="text-primary">AMINE ALLAMI JOUMAL ABDLALI </strong> - {{ currentYear }}
              </p>
              <p class="text-xs text-background/50 mt-1">
                Plateforme E-commerce avec ChatBot Intelligent • Architecture Microservices
              </p>
            </div>
            <div class="flex items-center gap-6 text-xs text-background/50">
              <a href="#" class="hover:text-primary transition-colors">Mentions légales</a>
              <a href="#" class="hover:text-primary transition-colors">Confidentialité</a>
              <a href="#" class="hover:text-primary transition-colors">CGV</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
