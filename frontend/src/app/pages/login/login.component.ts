import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4">
      <!-- Decorative Background -->
      <div class="fixed inset-0 overflow-hidden pointer-events-none">
        <div class="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/30 rounded-full blur-3xl"></div>
      </div>

      <!-- Login Card -->
      <div class="relative w-full max-w-md">
        <div class="bg-card rounded-3xl shadow-2xl shadow-primary/10 border border-border p-8 md:p-10">
          <!-- Header -->
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Bienvenue
            </h1>
            <p class="text-muted-foreground">Connectez-vous pour continuer</p>
          </div>

          <!-- Google Button -->
          <button
            type="button"
            (click)="loginWithGoogle()"
            [disabled]="isGoogleLoading()"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-border rounded-xl hover:bg-muted/50 transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isGoogleLoading()) {
              <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
              </svg>
              <span class="font-medium text-foreground">Connexion en cours...</span>
            } @else {
              <svg class="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span class="font-medium text-foreground">Continuer avec Google</span>
            }
          </button>

          <!-- Divider -->
          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-border"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="px-4 text-sm text-muted-foreground bg-card uppercase tracking-wider">
                ou continuer avec
              </span>
            </div>
          </div>

          <!-- Login Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div>
              <label for="email" class="block text-sm font-medium text-foreground mb-2">
                Email
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <input
                  type="email"
                  id="email"
                  [(ngModel)]="email"
                  name="email"
                  placeholder="Entrez votre email"
                  class="w-full pl-12 pr-4 py-3.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-sm font-medium text-foreground mb-2">
                Mot de passe
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg class="w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input
                  [type]="showPassword() ? 'text' : 'password'"
                  id="password"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Entrez votre mot de passe"
                  class="w-full pl-12 pr-12 py-3.5 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
                <button
                  type="button"
                  (click)="togglePassword()"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  @if (showPassword()) {
                    <svg class="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                    </svg>
                  } @else {
                    <svg class="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  }
                </button>
              </div>
            </div>

            <!-- Forgot Password -->
            <div class="text-right">
              <a href="#" class="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Mot de passe oublié ?
              </a>
            </div>

            <!-- Error Message -->
            @if (errorMessage()) {
              <div class="p-4 bg-destructive/10 border border-destructive/20 rounded-xl">
                <p class="text-sm text-destructive flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  {{ errorMessage() }}
                </p>
              </div>
            }

            <!-- Success Message -->
            @if (successMessage()) {
              <div class="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p class="text-sm text-green-600 flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  {{ successMessage() }}
                </p>
              </div>
            }

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="isLoading()"
              class="w-full py-4 px-4 bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold rounded-xl hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-primary/25"
            >
              @if (isLoading()) {
                <svg class="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                <span>Connexion en cours...</span>
              } @else {
                <span>Se connecter</span>
              }
            </button>
          </form>

          <!-- Sign Up Link -->
          <p class="mt-8 text-center text-muted-foreground">
            Vous n'avez pas de compte ?
            <a routerLink="/register" class="font-semibold text-primary hover:text-primary/80 transition-colors ml-1">
              Inscrivez-vous
            </a>
          </p>
        </div>

        <!-- Back to Home -->
        <div class="mt-6 text-center">
          <a routerLink="/" class="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
            </svg>
            Retour à l'accueil
          </a>
        </div>

        <!-- Demo Accounts (collapsible) -->
        <div class="mt-6">
          <button
            type="button"
            (click)="showDemoAccounts = !showDemoAccounts"
            class="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span>Comptes de démonstration</span>
            <svg [class]="'w-4 h-4 transition-transform ' + (showDemoAccounts ? 'rotate-180' : '')" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>
          
          @if (showDemoAccounts) {
            <div class="mt-4 grid grid-cols-3 gap-2">
              @for (account of demoAccounts; track account.email) {
                <button
                  type="button"
                  (click)="quickLogin(account.email, account.password)"
                  class="flex flex-col items-center gap-1 p-3 bg-card border border-border rounded-xl hover:bg-muted hover:border-primary/50 transition-all"
                >
                  <span class="text-xl">{{ account.icon }}</span>
                  <span class="text-xs font-medium text-foreground">{{ account.label }}</span>
                </button>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  email = '';
  password = '';
  showDemoAccounts = false;
  
  showPassword = signal(false);
  isLoading = signal(false);
  isGoogleLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  demoAccounts = [
    { email: 'admin@shopai.com', password: 'admin123', icon: '👑', label: 'Admin' },
    { email: 'seller@shopai.com', password: 'seller123', icon: '🏪', label: 'Vendeur' },
    { email: 'client@shopai.com', password: 'client123', icon: '🛒', label: 'Client' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  quickLogin(email: string, password: string): void {
    this.email = email;
    this.password = password;
    this.onSubmit();
  }

  async loginWithGoogle(): Promise<void> {
    this.isGoogleLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const result = await this.authService.loginWithGoogle();
      
      if (result.success) {
        this.successMessage.set(`Bienvenue ${result.user?.name} ! Redirection...`);
        setTimeout(() => {
          const redirect = this.authService.getDefaultRedirect();
          this.router.navigate([redirect]);
        }, 1000);
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (error) {
      this.errorMessage.set('Erreur lors de la connexion Google');
    } finally {
      this.isGoogleLoading.set(false);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMessage.set('Veuillez remplir tous les champs');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const result = await this.authService.login({
        email: this.email,
        password: this.password,
        rememberMe: true
      });

      if (result.success) {
        this.successMessage.set(`Bienvenue ${result.user?.name} ! Redirection...`);
        setTimeout(() => {
          const redirect = this.authService.getDefaultRedirect();
          this.router.navigate([redirect]);
        }, 1000);
      } else {
        this.errorMessage.set(result.message);
      }
    } catch (error) {
      this.errorMessage.set('Une erreur est survenue');
    } finally {
      this.isLoading.set(false);
    }
  }
}
