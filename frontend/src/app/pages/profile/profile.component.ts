import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { ROLE_INFO } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, HeaderComponent],
  template: `
    <div class="min-h-screen bg-background">
      <app-header></app-header>
      
      <main class="container mx-auto px-4 md:px-6 py-8">
        <!-- Profile Header -->
        <div class="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-3xl p-8 mb-8 relative overflow-hidden">
          <div class="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div class="relative flex flex-col md:flex-row items-center gap-6">
            <!-- Avatar -->
            <div class="relative">
              <div class="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {{ getInitials() }}
              </div>
              <button class="absolute bottom-0 right-0 w-10 h-10 bg-background border-2 border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors shadow-lg">
                <svg class="w-5 h-5 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
            </div>
            <!-- User Info -->
            <div class="text-center md:text-left flex-1">
              <h1 class="text-3xl font-bold text-foreground">{{ user()?.name }}</h1>
              <p class="text-muted-foreground">{{ user()?.email }}</p>
              <div class="flex items-center justify-center md:justify-start gap-2 mt-3">
                <span [class]="'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r text-white ' + getRoleColor()">
                  {{ getRoleIcon() }} {{ getRoleLabel() }}
                </span>
                <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  Actif
                </span>
              </div>
            </div>
            <!-- Quick Stats -->
            <div class="flex gap-4">
              <div class="text-center px-6 py-3 bg-background/50 backdrop-blur rounded-xl">
                <p class="text-2xl font-bold text-primary">{{ stats.orders }}</p>
                <p class="text-xs text-muted-foreground">Commandes</p>
              </div>
              <div class="text-center px-6 py-3 bg-background/50 backdrop-blur rounded-xl">
                <p class="text-2xl font-bold text-primary">{{ stats.wishlist }}</p>
                <p class="text-xs text-muted-foreground">Favoris</p>
              </div>
              <div class="text-center px-6 py-3 bg-background/50 backdrop-blur rounded-xl">
                <p class="text-2xl font-bold text-primary">{{ stats.reviews }}</p>
                <p class="text-xs text-muted-foreground">Avis</p>
              </div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Sidebar Navigation -->
          <div class="lg:col-span-1">
            <div class="bg-card border border-border rounded-2xl p-4 sticky top-24">
              <nav class="space-y-1">
                @for (tab of tabs; track tab.id) {
                  <button
                    (click)="activeTab = tab.id"
                    [class]="'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ' +
                      (activeTab === tab.id 
                        ? 'bg-primary text-primary-foreground' 
                        : 'hover:bg-muted text-foreground')"
                  >
                    <span class="text-xl">{{ tab.icon }}</span>
                    <span class="font-medium">{{ tab.label }}</span>
                  </button>
                }
              </nav>
              
              <div class="border-t border-border mt-4 pt-4">
                <button 
                  (click)="logout()"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <span class="font-medium">Déconnexion</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-2">
            <!-- Personal Info Tab -->
            @if (activeTab === 'personal') {
              <div class="bg-card border border-border rounded-2xl p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-bold text-foreground">Informations personnelles</h2>
                  <button 
                    (click)="isEditing = !isEditing"
                    class="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    {{ isEditing ? 'Annuler' : 'Modifier' }}
                  </button>
                </div>

                <form (ngSubmit)="saveProfile()" class="space-y-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Nom complet</label>
                      <input
                        type="text"
                        [(ngModel)]="profileForm.name"
                        name="name"
                        [disabled]="!isEditing"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        [(ngModel)]="profileForm.email"
                        name="email"
                        [disabled]="!isEditing"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Téléphone</label>
                      <input
                        type="tel"
                        [(ngModel)]="profileForm.phone"
                        name="phone"
                        [disabled]="!isEditing"
                        placeholder="+212 6XX XXX XXX"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Date de naissance</label>
                      <input
                        type="date"
                        [(ngModel)]="profileForm.birthDate"
                        name="birthDate"
                        [disabled]="!isEditing"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  @if (isEditing) {
                    <div class="flex justify-end gap-3">
                      <button
                        type="button"
                        (click)="isEditing = false"
                        class="px-6 py-3 border border-border rounded-xl hover:bg-muted transition-colors"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                      >
                        Enregistrer
                      </button>
                    </div>
                  }
                </form>
              </div>
            }

            <!-- Addresses Tab -->
            @if (activeTab === 'addresses') {
              <div class="bg-card border border-border rounded-2xl p-6">
                <div class="flex items-center justify-between mb-6">
                  <h2 class="text-xl font-bold text-foreground">Mes adresses</h2>
                  <button class="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    Ajouter
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  @for (address of addresses; track address.id) {
                    <div [class]="'p-4 border-2 rounded-xl relative ' + (address.isDefault ? 'border-primary bg-primary/5' : 'border-border')">
                      @if (address.isDefault) {
                        <span class="absolute top-3 right-3 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                          Par défaut
                        </span>
                      }
                      <div class="flex items-start gap-3">
                        <span class="text-2xl">{{ address.type === 'home' ? '🏠' : '🏢' }}</span>
                        <div class="flex-1">
                          <h3 class="font-semibold text-foreground">{{ address.label }}</h3>
                          <p class="text-sm text-muted-foreground mt-1">{{ address.fullAddress }}</p>
                          <p class="text-sm text-muted-foreground">{{ address.city }}, {{ address.postalCode }}</p>
                        </div>
                      </div>
                      <div class="flex gap-2 mt-4">
                        <button class="text-sm text-primary hover:underline">Modifier</button>
                        <span class="text-muted-foreground">•</span>
                        <button class="text-sm text-destructive hover:underline">Supprimer</button>
                      </div>
                    </div>
                  }
                </div>
              </div>
            }

            <!-- Security Tab -->
            @if (activeTab === 'security') {
              <div class="space-y-6">
                <div class="bg-card border border-border rounded-2xl p-6">
                  <h2 class="text-xl font-bold text-foreground mb-6">Changer le mot de passe</h2>
                  <form class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Mot de passe actuel</label>
                      <input
                        type="password"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Nouveau mot de passe</label>
                      <input
                        type="password"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2">Confirmer le mot de passe</label>
                      <input
                        type="password"
                        class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="••••••••"
                      />
                    </div>
                    <button
                      type="submit"
                      class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      Mettre à jour
                    </button>
                  </form>
                </div>

                <div class="bg-card border border-border rounded-2xl p-6">
                  <h2 class="text-xl font-bold text-foreground mb-4">Authentification à deux facteurs</h2>
                  <p class="text-muted-foreground mb-4">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                  <button class="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                    Activer la 2FA
                  </button>
                </div>

                <div class="bg-card border border-destructive/50 rounded-2xl p-6">
                  <h2 class="text-xl font-bold text-destructive mb-4">Zone de danger</h2>
                  <p class="text-muted-foreground mb-4">Une fois votre compte supprimé, toutes vos données seront perdues.</p>
                  <button class="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors">
                    Supprimer mon compte
                  </button>
                </div>
              </div>
            }

            <!-- Notifications Tab -->
            @if (activeTab === 'notifications') {
              <div class="bg-card border border-border rounded-2xl p-6">
                <h2 class="text-xl font-bold text-foreground mb-6">Préférences de notification</h2>
                
                <div class="space-y-4">
                  @for (pref of notificationPrefs; track pref.id) {
                    <div class="flex items-center justify-between p-4 border border-border rounded-xl">
                      <div class="flex items-center gap-4">
                        <span class="text-2xl">{{ pref.icon }}</span>
                        <div>
                          <h3 class="font-medium text-foreground">{{ pref.label }}</h3>
                          <p class="text-sm text-muted-foreground">{{ pref.description }}</p>
                        </div>
                      </div>
                      <button
                        (click)="pref.enabled = !pref.enabled"
                        [class]="'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ' +
                          (pref.enabled ? 'bg-primary' : 'bg-muted')"
                      >
                        <span
                          [class]="'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ' +
                            (pref.enabled ? 'translate-x-5' : 'translate-x-0')"
                        ></span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </main>
    </div>
  `
})
export class ProfileComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  activeTab = 'personal';
  isEditing = false;

  stats = {
    orders: 12,
    wishlist: 8,
    reviews: 5
  };

  tabs = [
    { id: 'personal', label: 'Informations', icon: '👤' },
    { id: 'addresses', label: 'Adresses', icon: '📍' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  profileForm = {
    name: this.user()?.name || '',
    email: this.user()?.email || '',
    phone: this.user()?.phone || '',
    birthDate: ''
  };

  addresses = [
    { id: '1', label: 'Maison', type: 'home', fullAddress: '123 Rue Mohammed V', city: 'Casablanca', postalCode: '20000', isDefault: true },
    { id: '2', label: 'Bureau', type: 'work', fullAddress: '456 Avenue Hassan II', city: 'Rabat', postalCode: '10000', isDefault: false }
  ];

  notificationPrefs = [
    { id: 'email', icon: '📧', label: 'Notifications par email', description: 'Recevoir des mises à jour par email', enabled: true },
    { id: 'sms', icon: '📱', label: 'Notifications SMS', description: 'Recevoir des alertes par SMS', enabled: false },
    { id: 'promo', icon: '🎁', label: 'Promotions', description: 'Recevoir les offres et promotions', enabled: true },
    { id: 'order', icon: '📦', label: 'Suivi de commande', description: 'Être informé du statut de vos commandes', enabled: true }
  ];

  constructor() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }

  getInitials(): string {
    const name = this.user()?.name || 'U';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleColor(): string {
    const role = this.user()?.role || 'client';
    return ROLE_INFO[role].color;
  }

  getRoleIcon(): string {
    const role = this.user()?.role || 'client';
    return ROLE_INFO[role].icon;
  }

  getRoleLabel(): string {
    const role = this.user()?.role || 'client';
    return ROLE_INFO[role].label;
  }

  saveProfile(): void {
    this.isEditing = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}


