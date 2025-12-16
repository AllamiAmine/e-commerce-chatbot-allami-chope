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

        <!-- Error Message -->
        @if (errorMessage()) {
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <svg class="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <p class="text-sm text-yellow-800">{{ errorMessage() }}</p>
            <button 
              (click)="loadUsersFromBackend()"
              class="ml-auto px-3 py-1 text-sm bg-yellow-200 hover:bg-yellow-300 text-yellow-800 rounded-lg transition-colors"
            >
              Réessayer
            </button>
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
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
          <div class="bg-background rounded-2xl border border-border w-full max-w-md p-6 animate-in fade-in zoom-in-95" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-foreground">
                {{ editingUser() ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur' }}
              </h2>
              <button (click)="closeModal()" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form (ngSubmit)="saveUser()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Nom complet</label>
                <input
                  type="text"
                  [(ngModel)]="formData.name"
                  name="name"
                  class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  [(ngModel)]="formData.email"
                  name="email"
                  class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Téléphone</label>
                <input
                  type="tel"
                  [(ngModel)]="formData.phone"
                  name="phone"
                  placeholder="+212 6XX XXX XXX"
                  class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Rôle</label>
                <div class="grid grid-cols-3 gap-2">
                  @for (role of roles; track role.value) {
                    <button
                      type="button"
                      (click)="formData.role = role.value"
                      [class]="'flex flex-col items-center gap-1 p-3 border-2 rounded-xl transition-all ' + 
                        (formData.role === role.value 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:border-primary/50')"
                    >
                      <span class="text-xl">{{ role.icon }}</span>
                      <span class="text-xs font-medium">{{ role.label }}</span>
                    </button>
                  }
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-foreground mb-2">Statut</label>
                <select
                  [(ngModel)]="formData.status"
                  name="status"
                  class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                  <option value="banned">Banni</option>
                </select>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="button"
                  (click)="closeModal()"
                  class="flex-1 px-4 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  class="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {{ editingUser() ? 'Enregistrer' : 'Ajouter' }}
                </button>
              </div>
            </form>
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

  searchQuery = '';
  filterRole: UserRole | null = null;
  
  showModal = signal(false);
  showDeleteModal = signal(false);
  editingUser = signal<UserDisplay | null>(null);
  userToDelete = signal<UserDisplay | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');

  formData = {
    name: '',
    email: '',
    phone: '',
    role: 'client' as UserRole,
    status: 'active' as 'active' | 'inactive' | 'banned'
  };

  roles = [
    { value: 'client' as UserRole, label: 'Client', icon: '🛒' },
    { value: 'seller' as UserRole, label: 'Vendeur', icon: '🏪' },
    { value: 'admin' as UserRole, label: 'Admin', icon: '👑' },
  ];

  // Users data - will be loaded from backend
  users: UserDisplay[] = [];

  // Demo fallback users (used when backend is unavailable)
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

    try {
      const response = await firstValueFrom(this.apiService.getAllUsers());
      
      if (response.success && response.data) {
        // Map backend users to UserDisplay format
        this.users = response.data.map((user: any) => ({
          id: user.id.toString(),
          name: user.name,
          email: user.email,
          role: (user.role?.toLowerCase() || 'client') as UserRole,
          phone: user.phone || undefined,
          createdAt: new Date(user.createdAt || user.created_at || Date.now()),
          status: this.mapStatus(user.status || user.enabled)
        }));
        console.log('✅ Users loaded from MySQL:', this.users.length);
      } else {
        console.warn('⚠️ Backend returned no data, using demo users');
        this.users = [...this.demoUsers];
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to load users from backend:', error.message);
      
      if (error.message?.includes('403') || error.message?.includes('autorisé')) {
        this.errorMessage.set('Accès refusé. Veuillez vous reconnecter en tant qu\'administrateur.');
      } else if (error.message?.includes('401') || error.message?.includes('session')) {
        this.errorMessage.set('Session expirée. Veuillez vous reconnecter.');
      } else if (error.message?.includes('connecter au serveur')) {
        this.errorMessage.set('Backend non accessible. Vérifiez que les services sont démarrés (port 8080 & 8081).');
      } else {
        this.errorMessage.set('Impossible de charger les utilisateurs. ' + (error.message || 'Erreur inconnue'));
      }
      
      this.users = [...this.demoUsers];
    } finally {
      this.isLoading.set(false);
    }
  }

  private mapStatus(status: any): 'active' | 'inactive' | 'banned' {
    if (typeof status === 'boolean') {
      return status ? 'active' : 'inactive';
    }
    if (typeof status === 'string') {
      const s = status.toLowerCase();
      if (s === 'active' || s === 'enabled' || s === 'true') return 'active';
      if (s === 'banned' || s === 'blocked') return 'banned';
      return 'inactive';
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
    this.formData = {
      name: '',
      email: '',
      phone: '',
      role: 'client',
      status: 'active'
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
      status: user.status
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingUser.set(null);
  }

  saveUser(): void {
    if (!this.formData.name || !this.formData.email) return;

    if (this.editingUser()) {
      // Update existing user
      const index = this.users.findIndex(u => u.id === this.editingUser()!.id);
      if (index !== -1) {
        this.users[index] = {
          ...this.users[index],
          name: this.formData.name,
          email: this.formData.email,
          phone: this.formData.phone || undefined,
          role: this.formData.role,
          status: this.formData.status
        };
      }
    } else {
      // Add new user
      const newUser: UserDisplay = {
        id: Date.now().toString(),
        name: this.formData.name,
        email: this.formData.email,
        phone: this.formData.phone || undefined,
        role: this.formData.role,
        status: this.formData.status,
        createdAt: new Date()
      };
      this.users = [newUser, ...this.users];
    }

    this.closeModal();
  }

  toggleStatus(user: UserDisplay): void {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      this.users[index].status = user.status === 'active' ? 'inactive' : 'active';
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

  confirmDelete(): void {
    const user = this.userToDelete();
    if (user) {
      this.users = this.users.filter(u => u.id !== user.id);
    }
    this.closeDeleteModal();
  }
}

