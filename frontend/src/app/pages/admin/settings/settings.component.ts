import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-muted/30">
      <!-- Header -->
      <header class="bg-background border-b border-border sticky top-0 z-40">
        <div class="container mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <a routerLink="/admin" class="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
                </svg>
                <span class="hidden sm:inline">Retour</span>
              </a>
              <div class="h-6 w-px bg-border"></div>
              <h1 class="text-xl font-bold text-foreground flex items-center gap-2">
                ⚙️ Paramètres de la Boutique
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-8 max-w-4xl">
        <!-- Success Message -->
        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-green-800">{{ successMessage() }}</p>
            <button (click)="successMessage.set('')" class="ml-auto text-green-600 hover:text-green-800">✕</button>
          </div>
        }

        <!-- General Settings -->
        <div class="bg-background rounded-2xl border border-border p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-6">Paramètres généraux</h2>
          
          <form (ngSubmit)="saveSettings()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Nom de la boutique</label>
              <input
                type="text"
                [(ngModel)]="settings.storeName"
                name="storeName"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Email de contact</label>
              <input
                type="email"
                [(ngModel)]="settings.contactEmail"
                name="contactEmail"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Téléphone de contact</label>
              <input
                type="tel"
                [(ngModel)]="settings.contactPhone"
                name="contactPhone"
                placeholder="+212 6XX XXX XXX"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Adresse</label>
              <textarea
                [(ngModel)]="settings.address"
                name="address"
                rows="3"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Devise</label>
              <select
                [(ngModel)]="settings.currency"
                name="currency"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="MAD">MAD (Dirham marocain)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dollar américain)</option>
              </select>
            </div>

            <div class="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <label class="text-sm font-medium text-foreground">Mode maintenance</label>
                <p class="text-xs text-muted-foreground">Désactive temporairement la boutique</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings.maintenanceMode"
                  name="maintenanceMode"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <button
              type="submit"
              class="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              Enregistrer les paramètres
            </button>
          </form>
        </div>

        <!-- Shipping Settings -->
        <div class="bg-background rounded-2xl border border-border p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-6">Paramètres de livraison</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Frais de livraison standard (MAD)</label>
              <input
                type="number"
                [(ngModel)]="settings.shippingStandard"
                step="0.01"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Frais de livraison express (MAD)</label>
              <input
                type="number"
                [(ngModel)]="settings.shippingExpress"
                step="0.01"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Délai de livraison standard (jours)</label>
              <input
                type="number"
                [(ngModel)]="settings.deliveryDays"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <!-- Payment Settings -->
        <div class="bg-background rounded-2xl border border-border p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-6">Paramètres de paiement</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <label class="text-sm font-medium text-foreground">Paiement par carte</label>
                <p class="text-xs text-muted-foreground">Accepter les paiements par carte bancaire</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings.paymentCard"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <label class="text-sm font-medium text-foreground">Paiement à la livraison</label>
                <p class="text-xs text-muted-foreground">Accepter les paiements en espèces à la livraison</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="settings.paymentCOD"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Frais paiement à la livraison (MAD)</label>
              <input
                type="number"
                [(ngModel)]="settings.codFee"
                step="0.01"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        <!-- Tax Settings -->
        <div class="bg-background rounded-2xl border border-border p-6">
          <h2 class="text-lg font-semibold text-foreground mb-6">Paramètres fiscaux</h2>
          
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Taux de TVA (%)</label>
              <input
                type="number"
                [(ngModel)]="settings.taxRate"
                step="0.1"
                min="0"
                max="100"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminSettingsComponent implements OnInit {
  authService = inject(AuthService);

  successMessage = signal('');
  
  settings = {
    storeName: 'ALLAMI SHOP',
    contactEmail: 'support@allamishop.ma',
    contactPhone: '+212 6XX XXX XXX',
    address: 'Casablanca, Maroc',
    currency: 'MAD',
    maintenanceMode: false,
    shippingStandard: 29.90,
    shippingExpress: 59.90,
    deliveryDays: 5,
    paymentCard: true,
    paymentCOD: true,
    codFee: 20.00,
    taxRate: 20.0
  };

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    // Load from localStorage or backend
    const saved = localStorage.getItem('admin_settings');
    if (saved) {
      try {
        this.settings = { ...this.settings, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Could not load settings:', e);
      }
    }
  }

  saveSettings(): void {
    // Save to localStorage (in production, save to backend)
    localStorage.setItem('admin_settings', JSON.stringify(this.settings));
    this.successMessage.set('Paramètres enregistrés avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }
}


