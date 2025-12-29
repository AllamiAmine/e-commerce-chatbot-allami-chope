import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { User, UserRole, LoginCredentials, RegisterData, ROLE_PERMISSIONS, RolePermissions } from '../models/user.model';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiService = inject(ApiService);
  private router = inject(Router);
  
  private currentUser = signal<User | null>(null);
  private useBackend = signal<boolean>(true); // Toggle to use backend or demo mode
  
  readonly user = this.currentUser.asReadonly();
  readonly isLoggedIn = computed(() => this.currentUser()?.isLoggedIn ?? false);
  readonly userRole = computed(() => this.currentUser()?.role ?? null);
  readonly isAdmin = computed(() => this.currentUser()?.role === 'admin');
  readonly isSeller = computed(() => this.currentUser()?.role === 'seller');
  readonly isClient = computed(() => this.currentUser()?.role === 'client');

  private demoUsers: Record<string, { password: string; user: Omit<User, 'isLoggedIn'> }> = {
    'admin@shopai.com': {
      password: 'admin123',
      user: {
        id: '1',
        email: 'admin@shopai.com',
        name: 'Admin ShopAI',
        role: 'admin',
        avatar: '',
        createdAt: new Date('2024-01-01'),
      }
    },
    'seller@shopai.com': {
      password: 'seller123',
      user: {
        id: '2',
        email: 'seller@shopai.com',
        name: 'Vendeur Demo',
        role: 'seller',
        avatar: '',
        createdAt: new Date('2024-06-01'),
      }
    },
    'client@shopai.com': {
      password: 'client123',
      user: {
        id: '3',
        email: 'client@shopai.com',
        name: 'Client Demo',
        role: 'client',
        avatar: '',
        createdAt: new Date('2024-09-01'),
      }
    }
  };

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.isLoggedIn) {
          this.currentUser.set(user);
          if (token && this.useBackend()) {
            this.validateSession();
          }
        }
      }
    } catch {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }

  private async validateSession(): Promise<void> {
    try {
      await firstValueFrom(this.apiService.validateToken());
    } catch {
      this.logout();
    }
  }

  private saveUserToStorage(user: User, token?: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    if (token) {
      localStorage.setItem('token', token);
    }
  }

  async login(credentials: LoginCredentials): Promise<{ success: boolean; message: string; user?: User }> {
    if (this.useBackend()) {
      try {
        const response = await firstValueFrom(
          this.apiService.login(credentials.email, credentials.password)
        );
        
        if (response.success && response.data) {
          const userData = response.data;
          const user: User = {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name,
            role: userData.role.toLowerCase() as UserRole,
            avatar: '',
            createdAt: new Date(),
            isLoggedIn: true,
          };
          
          this.currentUser.set(user);
          this.saveUserToStorage(user, userData.token);
          return { success: true, message: 'Connexion réussie', user };
        }
        
        return { success: false, message: response.message || 'Échec de la connexion' };
      } catch (error: any) {
        console.warn('Backend login failed, falling back to demo mode:', error.message);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        const demoUser = this.demoUsers[credentials.email.toLowerCase()];
        
        if (demoUser && demoUser.password === credentials.password) {
          const user: User = {
            ...demoUser.user,
            isLoggedIn: true,
          };
          this.currentUser.set(user);
          this.saveUserToStorage(user);
          resolve({ success: true, message: 'Connexion réussie (Mode démo)', user });
        } else {
          resolve({ success: false, message: 'Email ou mot de passe incorrect' });
        }
      }, 500);
    });
  }

  async register(data: RegisterData): Promise<{ success: boolean; message: string; user?: User }> {
    if (this.useBackend()) {
      try {
        const response = await firstValueFrom(
          this.apiService.register({
            name: data.fullName,
            email: data.email,
            password: data.password,
            phone: data.phone,
            role: data.role.toUpperCase()
          })
        );
        
        if (response.success && response.data) {
          const userData = response.data;
          const user: User = {
            id: userData.id.toString(),
            email: userData.email,
            name: userData.name,
            role: userData.role.toLowerCase() as UserRole,
            phone: data.phone,
            avatar: '',
            createdAt: new Date(),
            isLoggedIn: true,
          };
          
          this.currentUser.set(user);
          this.saveUserToStorage(user, userData.token);
          return { success: true, message: 'Compte créé avec succès', user };
        }
        
        return { success: false, message: response.message || 'Échec de l\'inscription' };
      } catch (error: any) {
        console.warn('Backend register failed, falling back to demo mode:', error.message);
      }
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        if (this.demoUsers[data.email.toLowerCase()]) {
          resolve({ success: false, message: 'Cet email est déjà utilisé' });
          return;
        }

        const newUser: User = {
          id: Date.now().toString(),
          email: data.email,
          name: data.fullName,
          role: data.role,
          phone: data.phone,
          createdAt: new Date(),
          isLoggedIn: true,
        };

        this.currentUser.set(newUser);
        this.saveUserToStorage(newUser);
        resolve({ success: true, message: 'Compte créé avec succès (Mode démo)', user: newUser });
      }, 500);
    });
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  getPermissions(): RolePermissions | null {
    const role = this.userRole();
    return role ? ROLE_PERMISSIONS[role] : null;
  }

  hasPermission(permission: keyof RolePermissions): boolean {
    const permissions = this.getPermissions();
    return permissions ? permissions[permission] : false;
  }

  getDefaultRedirect(): string {
    const role = this.userRole();
    switch (role) {
      case 'admin':
        return '/admin';
      case 'seller':
        return '/seller';
      case 'client':
      default:
        return '/';
    }
  }

  setBackendMode(enabled: boolean): void {
    this.useBackend.set(enabled);
  }

  isBackendMode(): boolean {
    return this.useBackend();
  }

  async loginWithGoogle(): Promise<{ success: boolean; message: string; user?: User }> {
    return this.simulateGoogleLogin();
  }

  private async simulateGoogleLogin(): Promise<{ success: boolean; message: string; user?: User }> {
    return new Promise((resolve) => {
      const randomId = Math.floor(Math.random() * 10000);
      const demoEmails = [
        'demo.user@gmail.com',
        'test.account@gmail.com',
        'example.user@gmail.com'
      ];
      const randomEmail = demoEmails[Math.floor(Math.random() * demoEmails.length)];
      
      setTimeout(() => {
        const user: User = {
          id: 'google_' + Date.now() + '_' + randomId,
          email: randomEmail,
          name: 'Utilisateur Google',
          role: 'client',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&fit=crop&q=80',
          createdAt: new Date(),
          isLoggedIn: true,
        };

        this.currentUser.set(user);
        this.saveUserToStorage(user);
        resolve({ success: true, message: 'Connexion Google réussie', user });
      }, 800);
    });
  }
}

declare const google: {
  accounts: {
    id: {
      initialize: (config: any) => void;
      prompt: (callback?: (notification: any) => void) => void;
      renderButton: (element: HTMLElement, config: any) => void;
    };
  };
};
