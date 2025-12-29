import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ChatbotService } from '../../../services/chatbot.service';

@Component({
  selector: 'app-admin-chatbot',
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
                🤖 Configuration ChatBot IA
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

        <!-- ChatBot Status -->
        <div class="bg-background rounded-2xl border border-border p-6 mb-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-foreground">Statut du ChatBot</h2>
            <div class="flex items-center gap-2">
              <div [class]="'w-3 h-3 rounded-full ' + (chatbotConfig.enabled ? 'bg-green-500 animate-pulse' : 'bg-gray-400')"></div>
              <span class="text-sm font-medium" [class.text-green-600]="chatbotConfig.enabled" [class.text-gray-500]="!chatbotConfig.enabled">
                {{ chatbotConfig.enabled ? 'Actif' : 'Inactif' }}
              </span>
            </div>
          </div>

          <div class="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
            <div>
              <label class="text-sm font-medium text-foreground">Activer le ChatBot</label>
              <p class="text-xs text-muted-foreground">Permettre aux clients d'interagir avec l'assistant IA</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [(ngModel)]="chatbotConfig.enabled"
                (change)="saveConfig()"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        <!-- AI Configuration -->
        <div class="bg-background rounded-2xl border border-border p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-6">Configuration IA</h2>
          
          <form (ngSubmit)="saveConfig()" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Message de bienvenue</label>
              <textarea
                [(ngModel)]="chatbotConfig.welcomeMessage"
                name="welcomeMessage"
                rows="4"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Message affiché lors de l'ouverture du chatbot..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Niveau de personnalisation</label>
              <select
                [(ngModel)]="chatbotConfig.personalizationLevel"
                name="personalizationLevel"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="basic">Basique - Recommandations simples</option>
                <option value="advanced">Avancé - Analyse approfondie des préférences</option>
                <option value="expert">Expert - Machine Learning complet</option>
              </select>
            </div>

            <div class="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <label class="text-sm font-medium text-foreground">Activer les recommandations IA</label>
                <p class="text-xs text-muted-foreground">Utiliser l'IA pour suggérer des produits</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="chatbotConfig.aiRecommendations"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div class="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
              <div>
                <label class="text-sm font-medium text-foreground">Activer le NLP (Natural Language Processing)</label>
                <p class="text-xs text-muted-foreground">Compréhension avancée du langage naturel</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  [(ngModel)]="chatbotConfig.nlpEnabled"
                  class="sr-only peer"
                />
                <div class="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">Temps de réponse simulé (ms)</label>
              <input
                type="number"
                [(ngModel)]="chatbotConfig.responseDelay"
                name="responseDelay"
                min="0"
                max="5000"
                step="100"
                class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <p class="text-xs text-muted-foreground mt-1">Délai pour simuler le traitement IA (0-5000ms)</p>
            </div>

            <button
              type="submit"
              class="w-full px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
            >
              Enregistrer la configuration
            </button>
          </form>
        </div>

        <!-- Quick Actions Configuration -->
        <div class="bg-background rounded-2xl border border-border p-6 mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-6">Actions rapides</h2>
          
          <div class="space-y-3">
            @for (action of chatbotConfig.quickActions; track $index; let i = $index) {
              <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                <input
                  type="text"
                  [(ngModel)]="chatbotConfig.quickActions[i]"
                  class="flex-1 px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Action rapide..."
                />
                <button
                  (click)="removeQuickAction(i)"
                  class="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            }
            <button
              (click)="addQuickAction()"
              class="w-full px-4 py-2 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Ajouter une action rapide
            </button>
          </div>
        </div>

        <!-- Test ChatBot -->
        <div class="bg-background rounded-2xl border border-border p-6">
          <h2 class="text-lg font-semibold text-foreground mb-4">Tester le ChatBot</h2>
          <p class="text-sm text-muted-foreground mb-4">Testez la configuration du chatbot avec un message</p>
          
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="testMessage"
              placeholder="Tapez un message de test..."
              (keyup.enter)="testChatbot()"
              class="flex-1 px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              (click)="testChatbot()"
              class="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              Tester
            </button>
          </div>

          @if (testResponse()) {
            <div class="mt-4 p-4 bg-muted/50 rounded-xl">
              <p class="text-sm text-muted-foreground mb-2">Réponse du ChatBot:</p>
              <p class="text-sm text-foreground" [innerHTML]="testResponse()"></p>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class AdminChatbotComponent implements OnInit {
  authService = inject(AuthService);
  private chatbotService = inject(ChatbotService);

  successMessage = signal('');
  testMessage = '';
  testResponse = signal('');

  chatbotConfig = {
    enabled: true,
    welcomeMessage: `Bonjour ! 👋 Je suis l'<strong>Assistant IA ShopAI</strong>, votre conseiller shopping intelligent.<br><br>
🤖 Grâce à notre <strong>Intelligence Artificielle avancée</strong>, je peux :<br>
• 🎯 <strong>Recommandations personnalisées</strong> basées sur vos préférences<br>
• 🔗 Trouver des <strong>produits similaires</strong> à ceux que vous aimez<br>
• 🔥 Vous montrer les <strong>produits populaires</strong><br>
• 🔍 Rechercher par catégorie ou mot-clé<br><br>
<strong>Essayez :</strong> "<em>Donne-moi des recommandations IA</em>" ou cliquez sur un bouton ci-dessous !`,
    personalizationLevel: 'advanced',
    aiRecommendations: true,
    nlpEnabled: true,
    responseDelay: 800,
    quickActions: [
      '🤖 Recommandations IA',
      '🔥 Produits populaires',
      '🔍 Chercher un produit',
      '📦 Suivre ma commande'
    ]
  };

  ngOnInit(): void {
    this.loadConfig();
  }

  loadConfig(): void {
    const saved = localStorage.getItem('chatbot_config');
    if (saved) {
      try {
        this.chatbotConfig = { ...this.chatbotConfig, ...JSON.parse(saved) };
      } catch (e) {
        console.warn('Could not load chatbot config:', e);
      }
    }
  }

  saveConfig(): void {
    localStorage.setItem('chatbot_config', JSON.stringify(this.chatbotConfig));
    this.successMessage.set('Configuration du ChatBot enregistrée avec succès');
    setTimeout(() => this.successMessage.set(''), 3000);
  }

  addQuickAction(): void {
    this.chatbotConfig.quickActions.push('Nouvelle action');
  }

  removeQuickAction(index: number): void {
    this.chatbotConfig.quickActions.splice(index, 1);
  }

  async testChatbot(): Promise<void> {
    if (!this.testMessage.trim()) return;

    try {
      const response = await this.chatbotService.sendMessage(this.testMessage);
      this.testResponse.set(response.text || 'Aucune réponse');
    } catch (error) {
      this.testResponse.set('Erreur lors du test: ' + (error as Error).message);
    }
  }
}


