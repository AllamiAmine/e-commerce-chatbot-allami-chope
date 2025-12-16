import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- Hero: Premium mobile store -->
    <section class="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-16 md:py-20">
      <div class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-32 -right-10 w-72 h-72 bg-primary/30 blur-3xl rounded-full"></div>
        <div class="absolute -bottom-32 -left-10 w-72 h-72 bg-amber-500/20 blur-3xl rounded-full"></div>
      </div>

      <div class="relative z-10 container mx-auto px-4 md:px-6">
        <div class="flex flex-col lg:flex-row gap-8 lg:gap-10 items-stretch">
          <!-- Left: Main hero product -->
          <div class="flex-1 bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-white/5 rounded-3xl p-6 md:p-8 shadow-2xl">
            <div class="flex items-center justify-between mb-6">
              <div>
                <p class="text-xs uppercase tracking-[0.3em] text-primary/80 mb-1">ALLAMI CHOPE</p>
                <h1 class="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Premium Mobile Store
                </h1>
              </div>
              <div class="text-right">
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-semibold border border-emerald-400/40">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Prix spécial
                </span>
              </div>
            </div>

            <div class="grid md:grid-cols-[1.4fr,1fr] gap-6 items-center">
              <div>
                <p class="text-sm text-slate-300 mb-2 uppercase tracking-[0.25em]">
                  KARKACHI PHONE • Édition Exclusive
                </p>
                <h2 class="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-3 leading-tight">
                  iPhone 17 Pro Max
                </h2>
                <p class="text-sm text-slate-300 mb-4 flex items-center gap-2">
                  <span class="inline-flex px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium">
                    Apple
                  </span>
                  <span class="text-xs text-slate-400">6.7" Super Retina XDR • A17 Pro • Titanium • USB‑C</span>
                </p>

                <div class="flex items-end gap-4 mb-6">
                  <div>
                    <div class="flex items-baseline gap-2">
                      <span class="text-3xl md:text-4xl font-extrabold text-amber-400">1 399 MAD</span>
                      <span class="text-sm line-through text-slate-500">1 599 MAD</span>
                    </div>
                    <p class="text-xs text-emerald-300 mt-1">Économie immédiate de 200 MAD</p>
                  </div>
                  <div class="ml-auto text-right hidden md:block">
                    <p class="text-xs text-slate-400">Stock limité</p>
                    <p class="text-sm font-medium text-emerald-300">Plus que 5 pièces</p>
                  </div>
                </div>

                <div class="flex flex-wrap gap-3 mb-6">
                  <button class="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 text-sm font-semibold hover:bg-amber-300 transition-colors shadow-lg shadow-amber-500/30">
                    DÉCOUVRIR
                    <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <button class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/15 text-sm font-medium text-white/90 hover:bg-white/5 transition-colors">
                    Voir tous les iPhone
                  </button>
                </div>

                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
                  <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <p class="text-[11px] text-slate-400">Écran</p>
                    <p class="font-medium">6.7" OLED 120Hz</p>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <p class="text-[11px] text-slate-400">Processeur</p>
                    <p class="font-medium">A17 Pro</p>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <p class="text-[11px] text-slate-400">Stockage</p>
                    <p class="font-medium">1 To</p>
                  </div>
                  <div class="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <p class="text-[11px] text-slate-400">Garantie</p>
                    <p class="font-medium">24 mois</p>
                  </div>
                </div>
              </div>

              <!-- Simple visual placeholder for phone -->
              <div class="relative h-64 md:h-72 lg:h-80">
                <div class="absolute inset-6 rounded-[2.5rem] bg-gradient-to-br from-slate-50 via-slate-200 to-slate-400 shadow-[0_25px_80px_rgba(0,0,0,0.7)]">
                  <div class="absolute inset-1 rounded-[2.2rem] bg-slate-900 flex items-center justify-center">
                    <div class="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-rose-500 blur-2xl opacity-70"></div>
                  </div>
                </div>
                <div class="absolute left-4 top-4 bg-black/60 text-[10px] px-2 py-1 rounded-full border border-white/10">
                  iPhone 17 Pro Max
                </div>
                <div class="absolute right-4 bottom-4 bg-black/70 text-[10px] px-2 py-1 rounded-full border border-white/10">
                  Livraison gratuite 24/48h
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Featured collection / brands -->
          <aside class="w-full lg:w-[320px] xl:w-[360px] space-y-5">
            <!-- Side banner -->
            <div class="h-full bg-slate-900/70 border border-white/5 rounded-3xl p-5 flex flex-col justify-between">
              <div>
                <p class="text-[11px] uppercase tracking-[0.25em] text-amber-400 mb-2">FEATURED</p>
                <h3 class="text-lg font-semibold mb-1">COLLECTION</h3>
                <p class="text-xs text-slate-300 mb-4">
                  Découvrez une sélection d’appareils gaming et multimédia à prix exceptionnels.
                </p>
                <p class="text-[11px] font-medium text-slate-400 mb-1">Sony PlayStation Slim</p>
                <p class="text-xs text-slate-300 mb-3">
                  PS2 • PS3 • PS4 – Éditions compactes, parfaites pour tous les gamers.
                </p>
              </div>
              <button class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors">
                DISCOVER MORE PRODUCTS
              </button>
            </div>

            <!-- Brands strip -->
            <div class="bg-slate-900/80 border border-white/5 rounded-3xl p-4">
              <p class="text-[11px] uppercase tracking-[0.25em] text-slate-400 mb-3">MARQUES PARTENAIRES</p>
              <div class="flex flex-wrap gap-2 text-[11px] text-slate-200">
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Apple</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Samsung</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Huawei</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Xiaomi</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Dell</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Asus</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Lenovo</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">Sony</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">LG</span>
                <span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">HP</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <!-- Best seller highlight -->
    <section class="bg-background py-10 border-b border-border/60" id="deals">
      <div class="container mx-auto px-4 md:px-6">
        <div class="grid md:grid-cols-[2fr,1.5fr] gap-6 items-center">
          <div>
            <p class="text-xs uppercase tracking-[0.25em] text-primary mb-2">Best Seller</p>
            <h3 class="text-xl md:text-2xl font-bold mb-2">MacBook Pro 16-inch M3 Max</h3>
            <p class="text-sm text-muted-foreground mb-3">
              Apple Silicon M3 Max, Liquid Retina XDR Display – la référence pour les créateurs exigeants.
            </p>
            <p class="text-xs text-muted-foreground mb-4">Best Seller - Top performer</p>
            <div class="flex items-end gap-3 mb-4">
              <span class="text-2xl font-bold text-primary">3 499,00 MAD</span>
              <span class="text-sm line-through text-muted-foreground">3 799,00 MAD</span>
              <span class="inline-flex items-center px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                -8%
              </span>
            </div>
            <div class="flex flex-wrap gap-3">
              <button class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
                Shop Now
              </button>
              <button class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                Learn More
              </button>
            </div>
          </div>
          <div class="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <div class="aspect-[16/10] rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 mb-4 flex items-center justify-center">
              <span class="text-xs text-slate-200">Visuel MacBook Pro 16" M3 Max</span>
            </div>
            <p class="text-sm text-muted-foreground">
              Puissance maximale, autonomie exceptionnelle et écran XDR pour les workflows professionnels les plus lourds.
            </p>
          </div>
        </div>
      </div>
    </section>
  `
})
export class HeroComponent {}
