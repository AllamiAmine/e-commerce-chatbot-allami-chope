import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { User, UserRole, ROLE_INFO } from '../../../models/user.model';
import { firstValueFrom } from 'rxjs';

interface UserDisplay extends Omit<User, 'isLoggedIn'> {
  status: 'active' | 'inactive' | 'banned';
}

@Component({
  selector: 'app-admin-users',
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
                👥 Gestion des Utilisateurs
              </h1>
            </div>
            <button 
              (click)="openAddModal()"
              class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="hidden sm:inline">Ajouter un utilisateur</span>
            </button>
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-8">
        <!-- Filters & Search -->
        <div class="bg-background rounded-2xl border border-border p-4 mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <!-- Search -->
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Rechercher par nom ou email..."
                class="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <!-- Role Filter -->
            <div class="flex gap-2">
              <button 
                (click)="filterRole = null"
                [class]="'px-4 py-2 rounded-xl text-sm font-medium transition-colors ' + (filterRole === null ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80')"
              >
                Tous
              </button>
              @for (role of roles; track role.value) {
                <button 
                  (click)="filterRole = role.value"
                  [class]="'px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1 ' + (filterRole === role.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80')"
                >
                  <span>{{ role.icon }}</span>
                  <span class="hidden sm:inline">{{ role.label }}</span>
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Success Message -->
        @if (successMessage()) {
          <div class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg class="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p class="text-sm text-green-800">{{ successMessage() }}</p>
            <button 
              (click)="successMessage.set('')"
              class="ml-auto px-3 py-1 text-sm bg-green-200 hover:bg-green-300 text-green-800 rounded-lg transition-colors"
            >
              ✕
            </button>
          </div>
        }

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
            <div class="flex items-center gap-3 mb-3">
              <svg class="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p class="text-sm text-yellow-800 flex-1">{{ errorMessage() }}</p>
              <button 
                (click)="errorMessage.set('')"
                class="px-3 py-1 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
            <div class="flex gap-2">
              <button 
                (click)="loadUsersFromBackend()"
                class="px-4 py-2 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-lg transition-colors font-medium"
              >
                🔄 Réessayer
              </button>
              <button 
                (click)="testConnection()"
                class="px-4 py-2 text-sm bg-blue-200 hover:bg-blue-300 text-blue-800 rounded-lg transition-colors font-medium"
              >
                🔍 Tester la connexion
              </button>
              @if (!authService.isAdmin()) {
                <a 
                  routerLink="/login"
                  class="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
                >
                  🔐 Se connecter en tant qu'admin
                </a>
              }
            </div>
          </div>
        }

        <!-- Loading State -->
        @if (isLoading()) {
          <div class="bg-background rounded-2xl border border-border p-12 mb-6 flex flex-col items-center justify-center">
            <svg class="w-12 h-12 text-primary animate-spin mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
              <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
            </svg>
            <p class="text-muted-foreground">Chargement des utilisateurs depuis MySQL...</p>
          </div>
        }

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-foreground">{{ users.length }}</p>
            <p class="text-sm text-muted-foreground">Total utilisateurs</p>
            @if (users.length > 0) {
              <p class="text-xs text-muted-foreground mt-1">Chargés depuis MySQL</p>
            }
          </div>
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-green-600">{{ getActiveCount() }}</p>
            <p class="text-sm text-muted-foreground">Actifs</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-blue-600">{{ getRoleCount('client') }}</p>
            <p class="text-sm text-muted-foreground">Clients</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-purple-600">{{ getRoleCount('seller') }}</p>
            <p class="text-sm text-muted-foreground">Vendeurs</p>
          </div>
        </div>

        <!-- Users Table -->
        <div class="bg-background rounded-2xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-muted/50 border-b border-border">
                <tr>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Utilisateur</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Rôle</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground hidden md:table-cell">Téléphone</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground hidden lg:table-cell">Date d'inscription</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Statut</th>
                  <th class="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (user of filteredUsers(); track user.id) {
                  <tr class="border-b border-border hover:bg-muted/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <div [class]="'w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-semibold text-sm ' + getRoleColor(user.role)">
                          {{ getInitials(user.name) }}
                        </div>
                        <div>
                          <p class="font-medium text-foreground">{{ user.name }}</p>
                          <p class="text-sm text-muted-foreground">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r text-white ' + getRoleColor(user.role)">
                        {{ getRoleIcon(user.role) }} {{ getRoleLabel(user.role) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell">
                      <span class="text-sm text-muted-foreground">{{ user.phone || 'Non renseigné' }}</span>
                    </td>
                    <td class="px-6 py-4 hidden lg:table-cell">
                      <span class="text-sm text-muted-foreground">{{ formatDate(user.createdAt) }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <span [class]="'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ' + getStatusColor(user.status)">
                        <span [class]="'w-1.5 h-1.5 rounded-full ' + getStatusDot(user.status)"></span>
                        {{ getStatusLabel(user.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <button 
                          (click)="editUser(user)"
                          class="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Modifier"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button 
                          (click)="toggleStatus(user)"
                          [class]="'p-2 hover:bg-muted rounded-lg transition-colors ' + (user.status === 'active' ? 'text-orange-500 hover:text-orange-600' : 'text-green-500 hover:text-green-600')"
                          [title]="user.status === 'active' ? 'Désactiver' : 'Activer'"
                        >
                          @if (user.status === 'active') {
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"/>
                            </svg>
                          } @else {
                            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                            </svg>
                          }
                        </button>
                        <button 
                          (click)="deleteUser(user)"
                          class="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                          title="Supprimer"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="6" class="px-6 py-12 text-center">
                      <div class="flex flex-col items-center gap-3">
                        <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-3xl">
                          👥
                        </div>
                        <p class="text-muted-foreground">Aucun utilisateur trouvé</p>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in" (click)="closeModal()">
          <div class="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4" (click)="$event.stopPropagation()">
            <!-- Header with gradient -->
            <div class="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-b border-border p-6 rounded-t-2xl">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl shadow-lg">
                    {{ editingUser() ? '✏️' : '➕' }}
                  </div>
                  <div>
                    <h2 class="text-xl font-bold text-foreground">
                      {{ editingUser() ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur' }}
                    </h2>
                    <p class="text-sm text-muted-foreground">
                      {{ editingUser() ? 'Mettez à jour les informations de l\'utilisateur' : 'Remplissez le formulaire pour créer un compte' }}
                    </p>
                  </div>
                </div>
                <button (click)="closeModal()" class="p-2 hover:bg-background/50 rounded-lg transition-colors" [disabled]="isLoading()">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="p-6">

            <form (ngSubmit)="saveUser()" #userForm="ngForm" class="space-y-6">
              <!-- Personal Information Section -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-1 h-6 bg-primary rounded-full"></div>
                  <h3 class="text-sm font-semibold text-foreground uppercase tracking-wide">Informations personnelles</h3>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                      </svg>
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      [(ngModel)]="formData.name"
                      name="name"
                      #nameInput="ngModel"
                      required
                      minlength="2"
                      placeholder="Ex: Jean Dupont"
                      class="w-full px-4 py-3 border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      [class.border-input]="!nameInput.invalid || !nameInput.touched"
                      [class.border-red-500]="nameInput.invalid && nameInput.touched"
                      [class.border-green-500]="nameInput.valid && nameInput.touched && nameInput.value"
                    />
                    @if (nameInput.invalid && nameInput.touched) {
                      <p class="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        Le nom est requis (minimum 2 caractères)
                      </p>
                    } @else if (nameInput.valid && nameInput.touched) {
                      <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Nom valide
                      </p>
                    }
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      Email *
                    </label>
                    <input
                      type="email"
                      [(ngModel)]="formData.email"
                      name="email"
                      #emailInput="ngModel"
                      required
                      email
                      placeholder="exemple@email.com"
                      class="w-full px-4 py-3 border rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      [class.border-input]="!emailInput.invalid || !emailInput.touched"
                      [class.border-red-500]="emailInput.invalid && emailInput.touched"
                      [class.border-green-500]="emailInput.valid && emailInput.touched && emailInput.value"
                    />
                    @if (emailInput.invalid && emailInput.touched) {
                      <p class="text-xs text-red-500 mt-1 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        @if (emailInput.errors?.['required']) {
                          L'email est requis
                        } @else if (emailInput.errors?.['email']) {
                          Format d'email invalide
                        }
                      </p>
                    } @else if (emailInput.valid && emailInput.touched) {
                      <p class="text-xs text-green-600 mt-1 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                        </svg>
                        Email valide
                      </p>
                    }
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    [(ngModel)]="formData.phone"
                    name="phone"
                    placeholder="+212 6XX XXX XXX"
                    pattern="[+]?[0-9\s-]+"
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                  <p class="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Format: +212 6XX XXX XXX (optionnel)
                  </p>
                </div>
              </div>

              <!-- Role & Status Section -->
              <div class="space-y-4">
                <div class="flex items-center gap-2 mb-4">
                  <div class="w-1 h-6 bg-accent rounded-full"></div>
                  <h3 class="text-sm font-semibold text-foreground uppercase tracking-wide">Rôle & Statut</h3>
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                    <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                    Rôle de l'utilisateur
                  </label>
                  <div class="grid grid-cols-3 gap-3">
                    @for (role of roles; track role.value) {
                      <button
                        type="button"
                        (click)="formData.role = role.value"
                        [class]="'flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all hover:scale-105 ' + 
                          (formData.role === role.value 
                            ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20' 
                            : 'border-border hover:border-primary/50 bg-muted/30')"
                      >
                        <span class="text-2xl">{{ role.icon }}</span>
                        <span class="text-xs font-semibold">{{ role.label }}</span>
                        @if (formData.role === role.value) {
                          <svg class="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
                          </svg>
                        }
                      </button>
                    }
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Statut du compte
                    </label>
                    <select
                      [(ngModel)]="formData.status"
                      name="status"
                      class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    >
                      <option value="active">✅ Actif - L'utilisateur peut se connecter</option>
                      <option value="inactive">⏸️ Inactif - Compte temporairement désactivé</option>
                      <option value="banned">🚫 Banni - Accès refusé</option>
                    </select>
                  </div>

                  <!-- Password Preview (only for new users) -->
                  @if (!editingUser()) {
                    <div>
                      <label class="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                        <svg class="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        Mot de passe
                        <span class="text-xs text-muted-foreground font-normal">(optionnel)</span>
                      </label>
                      <div class="relative">
                        <input
                          [type]="showPassword ? 'text' : 'password'"
                          [(ngModel)]="formData.password"
                          name="password"
                          placeholder="Laisser vide pour générer automatiquement"
                          minlength="6"
                          #passwordInput="ngModel"
                          class="w-full px-4 py-3 pr-12 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                          [class.border-green-500]="passwordInput.value && passwordInput.value.length >= 8"
                        />
                        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <button
                            type="button"
                            (click)="showPassword = !showPassword"
                            class="p-1 hover:bg-muted rounded-lg transition-colors"
                            title="Afficher/Masquer"
                          >
                            @if (!showPassword) {
                              <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            } @else {
                              <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                              </svg>
                            }
                          </button>
                          <button
                            type="button"
                            (click)="generatePassword()"
                            class="p-1 hover:bg-muted rounded-lg transition-colors"
                            title="Générer un mot de passe sécurisé"
                          >
                            <svg class="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      @if (formData.password) {
                        <div class="mt-2">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="text-xs text-muted-foreground">Force du mot de passe:</span>
                            <div class="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                class="h-full transition-all duration-300"
                                [class]="getPasswordStrengthClass()"
                                [style.width.%]="getPasswordStrength()"
                              ></div>
                            </div>
                            <span class="text-xs font-medium" [class]="getPasswordStrengthTextClass()">{{ getPasswordStrengthLabel() }}</span>
                          </div>
                        </div>
                      }
                      <p class="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Si vide, un mot de passe sécurisé sera généré automatiquement
                      </p>
                    </div>
                  }
                </div>
              </div>

              <!-- User Preview Card -->
              @if (formData.name && formData.email) {
                <div class="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20 rounded-xl p-4">
                  <div class="flex items-center gap-2 mb-3">
                    <svg class="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    <span class="text-xs font-semibold text-foreground uppercase">Aperçu</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                      {{ getInitials(formData.name) }}
                    </div>
                    <div class="flex-1">
                      <p class="font-semibold text-foreground">{{ formData.name }}</p>
                      <p class="text-sm text-muted-foreground">{{ formData.email }}</p>
                      <div class="flex items-center gap-2 mt-1">
                        <span class="text-xs px-2 py-0.5 rounded-full bg-muted">
                          {{ getRoleLabel(formData.role) }}
                        </span>
                        <span class="text-xs px-2 py-0.5 rounded-full" [class]="getStatusColor(formData.status)">
                          {{ getStatusLabel(formData.status) }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              }

              <!-- Action Buttons -->
              <div class="flex gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  (click)="closeModal()"
                  [disabled]="isLoading()"
                  class="flex-1 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  Annuler
                </button>

                @if (isLoading()) {
                  <button
                    type="submit"
                    disabled
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl flex items-center justify-center gap-2 font-semibold opacity-70 cursor-not-allowed"
                  >
                    <svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                      <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                    </svg>
                    <span>Création en cours...</span>
                  </button>
                } @else {
                  <button
                    type="submit"
                    [disabled]="!userForm.valid || !formData.name.trim() || !formData.email.trim()"
                    class="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 font-semibold"
                  >
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                    </svg>
                    {{ editingUser() ? 'Mettre à jour' : 'Créer l\'utilisateur' }}
                  </button>
                }
              </div>
            </form>
            </div>
          </div>
        </div>
      }

      <!-- Delete Confirmation Modal -->
      @if (showDeleteModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeDeleteModal()">
          <div class="bg-background rounded-2xl border border-border w-full max-w-sm p-6 animate-in fade-in zoom-in-95" (click)="$event.stopPropagation()">
            <div class="text-center">
              <div class="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </div>
              <h3 class="text-lg font-bold text-foreground mb-2">Supprimer l'utilisateur ?</h3>
              <p class="text-sm text-muted-foreground mb-6">
                Êtes-vous sûr de vouloir supprimer <strong>{{ userToDelete()?.name }}</strong> ? Cette action est irréversible.
              </p>
              <div class="flex gap-3">
                <button
                  (click)="closeDeleteModal()"
                  class="flex-1 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  (click)="confirmDelete()"
                  class="flex-1 px-4 py-3 bg-destructive text-destructive-foreground rounded-xl hover:bg-destructive/90 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminUsersComponent implements OnInit {
  authService = inject(AuthService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  showPassword = false;

  searchQuery = '';
  filterRole: UserRole | null = null;
  
  showModal = signal(false);
  showDeleteModal = signal(false);
  editingUser = signal<UserDisplay | null>(null);
  userToDelete = signal<UserDisplay | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  formData = {
    name: '',
    email: '',
    phone: '',
    role: 'client' as UserRole,
    status: 'active' as 'active' | 'inactive' | 'banned',
    password: ''
  };

  roles = [
    { value: 'client' as UserRole, label: 'Client', icon: '🛒' },
    { value: 'seller' as UserRole, label: 'Vendeur', icon: '🏪' },
    { value: 'admin' as UserRole, label: 'Admin', icon: '👑' },
  ];

  users: UserDisplay[] = [];

  private demoUsers: UserDisplay[] = [
    { id: '1', name: 'Admin ShopAI', email: 'admin@shopai.com', role: 'admin', phone: '+212 600 000 001', createdAt: new Date('2024-01-01'), status: 'active' },
    { id: '2', name: 'Vendeur Demo', email: 'seller@shopai.com', role: 'seller', phone: '+212 600 000 002', createdAt: new Date('2024-06-01'), status: 'active' },
    { id: '3', name: 'Client Demo', email: 'client@shopai.com', role: 'client', phone: '+212 600 000 003', createdAt: new Date('2024-09-01'), status: 'active' },
  ];

  filteredUsers = computed(() => {
    let result = this.users;
    
    if (this.filterRole) {
      result = result.filter(u => u.role === this.filterRole);
    }
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) || 
        u.email.toLowerCase().includes(query)
      );
    }
    
    return result;
  });

  constructor() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.loadUsersFromBackend();
  }

  async loadUsersFromBackend(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const currentUser = this.authService.user();
    const token = localStorage.getItem('token');
    
    console.log('🔍 Loading users from backend...');
    console.log('  - Current user:', currentUser);
    console.log('  - Is admin:', this.authService.isAdmin());
    console.log('  - Token exists:', !!token);
    console.log('  - Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'none');

    if (!currentUser || !this.authService.isAdmin()) {
      this.errorMessage.set('Vous devez être connecté en tant qu\'administrateur pour accéder à cette page.');
      this.users = [...this.demoUsers];
      this.isLoading.set(false);
      return;
    }

    if (!token) {
      this.errorMessage.set('Token d\'authentification manquant. Veuillez vous reconnecter.');
      this.users = [...this.demoUsers];
      this.isLoading.set(false);
      return;
    }

    try {
      const response = await firstValueFrom(this.apiService.getAllUsers());
      console.log('📦 Backend response:', response);
      
      if (response.success && response.data) {
        console.log('📊 Raw users data from backend:', response.data);
        console.log('📊 Total users received:', response.data.length);
        
        this.users = response.data.map((user: any, index: number) => {
          console.log(`  User ${index + 1}:`, {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
            phone: user.phone
          });
          
          let normalizedRole = 'client';
          if (user.role) {
            const roleStr = user.role.toString().toLowerCase();
            if (roleStr === 'admin' || roleStr === 'administrator') {
              normalizedRole = 'admin';
            } else if (roleStr === 'seller' || roleStr === 'vendeur' || roleStr === 'vendor') {
              normalizedRole = 'seller';
            } else if (roleStr === 'client' || roleStr === 'customer' || roleStr === 'user') {
              normalizedRole = 'client';
            } else {
              console.warn(`⚠️ Unknown role "${user.role}" for user ${user.id}, defaulting to client`);
              normalizedRole = 'client';
            }
          }
          
          return {
            id: user.id?.toString() || String(index + 1),
            name: user.name || 'Utilisateur sans nom',
            email: user.email || 'email@manquant.com',
            role: normalizedRole as UserRole,
            phone: user.phone || undefined,
            createdAt: user.createdAt ? new Date(user.createdAt) : (user.created_at ? new Date(user.created_at) : new Date()),
            status: this.mapStatus(user.status || user.enabled || 'ACTIVE')
          };
        });
        
        console.log('✅ Users mapped successfully:', this.users.length);
        console.log('📋 Final users list:', this.users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
        this.errorMessage.set(''); // Clear any previous errors
      } else {
        console.warn('⚠️ Backend returned no data, using demo users');
        this.errorMessage.set('Aucune donnée reçue du backend. Utilisation des données de démonstration.');
        this.users = [...this.demoUsers];
      }
    } catch (error: any) {
      console.error('❌ Failed to load users from backend:', error);
      console.error('  - Error status:', error.status);
      console.error('  - Error message:', error.message);
      console.error('  - Error details:', error.error);
      
      if (error.status === 0 || error.message?.includes('connecter au serveur') || error.message?.includes('Failed to fetch')) {
        this.errorMessage.set('Backend non accessible. Vérifiez que les services sont démarrés (port 8080 & 8081).');
      } else if (error.status === 403 || error.message?.includes('403') || error.message?.includes('autorisé') || error.message?.includes('Access Denied')) {
        this.errorMessage.set('Accès refusé. Votre compte n\'a pas les permissions d\'administrateur. Veuillez vous reconnecter avec un compte admin.');
      } else if (error.status === 401 || error.message?.includes('401') || error.message?.includes('session') || error.message?.includes('Unauthorized')) {
        this.errorMessage.set('Session expirée. Veuillez vous reconnecter.');
        setTimeout(() => {
          this.authService.logout();
        }, 2000);
      } else {
        this.errorMessage.set('Impossible de charger les utilisateurs. ' + (error.error?.message || error.message || 'Erreur inconnue'));
      }
      
      this.users = [...this.demoUsers];
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapStatus(status: any): 'active' | 'inactive' | 'banned' {
    if (status === null || status === undefined) {
      return 'active'; // Default to active if status is missing
    }
    if (typeof status === 'boolean') {
      return status ? 'active' : 'inactive';
    }
    if (typeof status === 'string') {
      const s = status.toLowerCase().trim();
      if (s === 'active' || s === 'enabled' || s === 'true' || s === '1') return 'active';
      if (s === 'banned' || s === 'blocked' || s === 'ban') return 'banned';
      if (s === 'inactive' || s === 'disabled' || s === 'false' || s === '0') return 'inactive';
      console.warn(`⚠️ Unknown status "${status}", defaulting to active`);
      return 'active';
    }
    return 'active';
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  getRoleColor(role: UserRole): string {
    return ROLE_INFO[role].color;
  }

  getRoleIcon(role: UserRole): string {
    return ROLE_INFO[role].icon;
  }

  getRoleLabel(role: UserRole): string {
    return ROLE_INFO[role].label;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-600';
      case 'inactive': return 'bg-gray-100 text-gray-600';
      case 'banned': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  }

  getStatusDot(status: string): string {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'banned': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'banned': return 'Banni';
      default: return 'Inconnu';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getActiveCount(): number {
    return this.users.filter(u => u.status === 'active').length;
  }

  getRoleCount(role: UserRole): number {
    return this.users.filter(u => u.role === role).length;
  }

  openAddModal(): void {
    this.editingUser.set(null);
    this.showPassword = false;
    this.formData = {
      name: '',
      email: '',
      phone: '',
      role: 'client',
      status: 'active',
      password: ''
    };
    this.showModal.set(true);
  }

  editUser(user: UserDisplay): void {
    this.editingUser.set(user);
    this.formData = {
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      password: '' // Don't show password when editing
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    if (this.isLoading()) return; // Prevent closing during save
    
    this.showModal.set(false);
    this.editingUser.set(null);
    this.showPassword = false;
    this.errorMessage.set('');
    this.successMessage.set('');
    this.formData = {
      name: '',
      email: '',
      phone: '',
      role: 'client',
      status: 'active',
      password: ''
    };
  }

  async saveUser(): Promise<void> {
    if (!this.formData.name?.trim()) {
      this.errorMessage.set('Le nom est requis');
      return;
    }
    
    if (!this.formData.email?.trim()) {
      this.errorMessage.set('L\'email est requis');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.formData.email)) {
      this.errorMessage.set('Format d\'email invalide');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      if (this.editingUser()) {
        const response = await firstValueFrom(
          this.apiService.updateUser(Number(this.editingUser()!.id), {
            name: this.formData.name,
            email: this.formData.email,
            phone: this.formData.phone || null,
            role: this.formData.role.toUpperCase(),
            status: this.formData.status.toUpperCase()
          })
        );

        if (response.success) {
          await this.loadUsersFromBackend();
          this.successMessage.set('Utilisateur mis à jour avec succès');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.closeModal();
        } else {
          this.errorMessage.set(response.message || 'Erreur lors de la mise à jour');
        }
      } else {
        const response = await firstValueFrom(
          this.apiService.createUser({
            name: this.formData.name,
            email: this.formData.email,
            phone: this.formData.phone || undefined,
            role: this.formData.role,
            status: this.formData.status,
            password: this.formData.password || undefined
          })
        );

        if (response.success) {
          await this.loadUsersFromBackend();
          this.successMessage.set('Utilisateur créé avec succès dans MySQL');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.closeModal();
        } else {
          this.errorMessage.set(response.message || 'Erreur lors de la création');
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      const errorMsg = error?.error?.message || error?.message || 'Erreur lors de l\'enregistrement';
      this.errorMessage.set(errorMsg);
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      this.isLoading.set(false);
    }
  }

  async toggleStatus(user: UserDisplay): Promise<void> {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await firstValueFrom(
        this.apiService.updateUser(Number(user.id), {
          status: newStatus.toUpperCase()
        })
      );

      if (response.success) {
        await this.loadUsersFromBackend();
        this.successMessage.set('Statut mis à jour avec succès');
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        this.errorMessage.set(response.message || 'Erreur lors de la mise à jour du statut');
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      this.errorMessage.set(error.message || 'Erreur lors de la mise à jour');
    }
  }

  deleteUser(user: UserDisplay): void {
    this.userToDelete.set(user);
    this.showDeleteModal.set(true);
  }

  closeDeleteModal(): void {
    this.showDeleteModal.set(false);
    this.userToDelete.set(null);
  }

  async confirmDelete(): Promise<void> {
    const user = this.userToDelete();
    if (!user) {
      this.closeDeleteModal();
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.apiService.deleteUser(Number(user.id))
      );

      if (response.success) {
        await this.loadUsersFromBackend();
        this.successMessage.set('Utilisateur supprimé avec succès');
        setTimeout(() => this.successMessage.set(''), 3000);
        this.closeDeleteModal();
      } else {
        this.errorMessage.set(response.message || 'Erreur lors de la suppression');
        this.closeDeleteModal();
      }
    } catch (error: any) {
      console.error('Error deleting user:', error);
      this.errorMessage.set(error.message || 'Erreur lors de la suppression');
      this.closeDeleteModal();
    } finally {
      this.isLoading.set(false);
    }
  }

  async testConnection(): Promise<void> {
    console.log('🧪 Testing backend connection...');
    
    const currentUser = this.authService.user();
    const token = localStorage.getItem('token');
    
    const testInfo = {
      user: currentUser,
      isAdmin: this.authService.isAdmin(),
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 30) + '...' : 'none',
      apiUrl: 'http://localhost:8080/api/users/admin/all'
    };
    
    console.log('📋 Test Info:', testInfo);
    
    if (!currentUser) {
      alert('❌ Vous n\'êtes pas connecté. Veuillez vous connecter d\'abord.');
      return;
    }
    
    if (!this.authService.isAdmin()) {
      alert(`❌ Votre compte n'est pas administrateur.\n\nRôle actuel: ${currentUser.role}\n\nVeuillez vous connecter avec un compte admin.`);
      return;
    }
    
    if (!token) {
      alert('❌ Token d\'authentification manquant. Veuillez vous reconnecter.');
      return;
    }
    
    try {
      const response = await firstValueFrom(this.apiService.getAllUsers());
      console.log('✅ Connection test successful:', response);
      alert(`✅ Connexion réussie !\n\nUtilisateurs trouvés: ${response.data?.length || 0}\n\nVérifiez la console pour plus de détails.`);
      this.loadUsersFromBackend();
    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      const errorMsg = error.status === 403 
        ? '❌ Accès refusé (403). Votre token ne contient pas les permissions admin.'
        : error.status === 401
        ? '❌ Non autorisé (401). Votre token est invalide ou expiré.'
        : error.status === 0
        ? '❌ Impossible de se connecter au serveur. Vérifiez que les services backend sont démarrés.'
        : `❌ Erreur ${error.status}: ${error.message}`;
      alert(errorMsg + '\n\nVérifiez la console pour plus de détails.');
    }
  }

  generatePassword(): void {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    const values = new Uint32Array(length);
    crypto.getRandomValues(values);
    for (let i = 0; i < length; i++) {
      password += charset[values[i] % charset.length];
    }
    this.formData.password = password;
    this.showPassword = true;
  }

  getPasswordStrength(): number {
    const password = this.formData.password || '';
    if (password.length === 0) return 0;
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 20;
    
    return Math.min(strength, 100);
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'bg-red-500';
    if (strength < 70) return 'bg-orange-500';
    return 'bg-green-500';
  }

  getPasswordStrengthTextClass(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'text-red-600';
    if (strength < 70) return 'text-orange-600';
    return 'text-green-600';
  }

  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    if (strength < 40) return 'Faible';
    if (strength < 70) return 'Moyen';
    return 'Fort';
  }
}

