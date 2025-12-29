import { Component, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Message, Product, Category } from '../../models/product.model';
import { ChatbotService } from '../../services/chatbot.service';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (!isOpen) {
      <button
        (click)="openChat()"
        class="fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 z-40 group"
      >
        <div class="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
        <!-- AI Brain Icon -->
        <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/>
          <path d="M16 10a4 4 0 0 1 4 4v1a4 4 0 0 1-4 4"/>
          <path d="M8 10a4 4 0 0 0-4 4v1a4 4 0 0 0 4 4"/>
          <path d="M9 22v-4"/>
          <path d="M15 22v-4"/>
          <circle cx="9" cy="7" r="1" fill="currentColor"/>
          <circle cx="15" cy="7" r="1" fill="currentColor"/>
        </svg>
        <span class="absolute -top-12 right-0 bg-card text-foreground text-sm px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap border border-border">
          🤖 Assistant IA ShopAI
        </span>
      </button>
    } @else {
      <div class="fixed bottom-6 right-6 w-full max-w-md h-[600px] flex flex-col shadow-2xl z-40 bg-background border border-border rounded-2xl overflow-hidden animate-slideUp">
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary to-accent">
          <div class="flex items-center gap-3">
            <div class="relative">
              <div class="w-11 h-11 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <svg class="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                  <path d="M8 12a4 4 0 0 1 8 0"/>
                </svg>
              </div>
              <div class="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 class="font-semibold text-white flex items-center gap-2">
                Assistant IA
                <span class="text-xs bg-white/20 px-2 py-0.5 rounded-full">NLP</span>
              </h3>
              <p class="text-xs text-white/80 flex items-center gap-1">
                <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                Intelligence artificielle active
              </p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button (click)="clearChat()" class="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Effacer la conversation">
              <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              (click)="closeChat()" 
              class="px-3 py-1.5 flex items-center gap-1.5 hover:bg-white/10 rounded-lg transition-colors text-white text-sm font-medium"
              title="Fermer le chatbot"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span class="hidden sm:inline">Fermer</span>
            </button>
          </div>
        </div>

        <!-- Category Pills -->
        <div class="p-3 border-b border-border bg-muted/30 overflow-x-auto">
          <div class="flex gap-2 min-w-max">
            @for (category of categories; track category.id) {
              <button 
                (click)="browseCategory(category)"
                class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span>{{ category.icon }}</span>
                <span>{{ category.name }}</span>
              </button>
            }
          </div>
        </div>

        <!-- Messages -->
        <div class="flex-1 overflow-y-auto p-4 space-y-4" #messagesContainer>
          @for (message of messages; track message.id) {
            <div [class]="'flex gap-3 ' + (message.type === 'user' ? 'justify-end' : 'justify-start')" class="animate-fadeIn">
              @if (message.type === 'bot') {
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0 shadow-md">
                  <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                  </svg>
                </div>
              }
              <div class="flex flex-col gap-2 max-w-[85%]">
                <div [class]="'px-4 py-3 rounded-2xl ' + (message.type === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md')">
                  <p class="text-sm leading-relaxed" [innerHTML]="message.content"></p>
                  <span class="text-xs opacity-60 mt-1 block">{{ formatTime(message.timestamp) }}</span>
                </div>
                
                <!-- Product Cards -->
                @if (message.products && message.products.length > 0) {
                  <div class="grid grid-cols-2 gap-2 mt-2">
                    @for (product of message.products; track product.id) {
                      <div class="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                        <div class="relative h-24 bg-muted overflow-hidden">
                          <img [src]="product.image" [alt]="product.name" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300">
                          @if (product.badge) {
                            <span class="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground">
                              {{ product.badge }}
                            </span>
                          }
                        </div>
                        <div class="p-2">
                          <h4 class="text-xs font-medium text-foreground line-clamp-1">{{ product.name }}</h4>
                          <div class="flex items-center justify-between mt-1">
                            <span class="text-xs font-bold text-primary">{{ product.price | number:'1.2-2' }} MAD</span>
                            <div class="flex items-center gap-0.5">
                              <svg class="w-3 h-3 text-yellow-500 fill-yellow-500" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              <span class="text-[10px] text-muted-foreground">{{ product.rating }}</span>
                            </div>
                          </div>
                          <div class="flex gap-1 mt-2">
                            <button 
                              (click)="addToCart(product)"
                              class="flex-1 text-[10px] py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                            >
                              🛒 Ajouter
                            </button>
                            <button 
                              (click)="viewProduct(product)"
                              class="px-2 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors"
                            >
                              <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
          
          @if (isLoading) {
            <div class="flex gap-3 animate-fadeIn">
              <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                <div class="w-3 h-3 rounded-full bg-white animate-pulse"></div>
              </div>
              <div class="bg-muted px-4 py-3 rounded-2xl rounded-bl-md">
                <div class="flex items-center gap-2">
                  <svg class="w-4 h-4 text-primary animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                  </svg>
                  <span class="text-xs text-muted-foreground">Analyse IA en cours</span>
                  <div class="flex gap-1">
                    <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 0.1s"></div>
                    <div class="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style="animation-delay: 0.2s"></div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        <!-- Quick Actions -->
        @if (messages.length <= 2) {
          <div class="p-3 border-t border-border bg-muted/30">
            <p class="text-xs text-muted-foreground mb-2">💡 Essayez :</p>
            <div class="flex flex-wrap gap-2">
              @for (action of quickActions; track action) {
                <button 
                  (click)="sendQuickAction(action)"
                  class="text-xs px-3 py-1.5 rounded-full bg-card border border-border hover:border-primary hover:bg-primary/5 transition-all"
                >
                  {{ action }}
                </button>
              }
            </div>
          </div>
        }

        <!-- Input -->
        <div class="p-4 border-t border-border bg-card">
          <div class="flex gap-2">
            <input
              type="text"
              [(ngModel)]="input"
              (keyup.enter)="handleSend()"
              placeholder="Posez votre question à l'IA..."
              class="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <button
              (click)="handleSend()"
              [disabled]="!input.trim() || isLoading"
              class="h-12 w-12 rounded-xl inline-flex items-center justify-center bg-primary text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50 transition-all hover:scale-105"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
          <div class="flex items-center justify-between mt-3">
            <div class="flex items-center justify-center gap-2">
              <div class="flex items-center gap-1">
                <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span class="text-xs text-muted-foreground">IA Active</span>
              </div>
              <span class="text-xs text-muted-foreground">•</span>
              <span class="text-xs text-muted-foreground">NLP Intelligent</span>
              <span class="text-xs text-muted-foreground">•</span>
              <span class="text-xs text-muted-foreground">24/7</span>
            </div>
            <button
              (click)="closeChat()"
              class="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex items-center gap-1.5"
              title="Fermer le chatbot"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>Fermer</span>
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out forwards;
    }
    .line-clamp-1 {
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;
  
  isOpen = false;
  isLoading = false;
  input = '';
  categories: Category[] = [];
  
  quickActions = [
    '🤖 Recommandations IA',
    '🔥 Produits populaires',
    '🔍 Chercher un produit',
    '📦 Suivre ma commande'
  ];

  messages: Message[] = [];

  private welcomeMessage: Message = {
    id: '1',
    type: 'bot',
    content: `Bonjour ! 👋 Je suis l'<strong>Assistant IA ShopAI</strong>, votre conseiller shopping intelligent.<br><br>
🤖 Grâce à notre <strong>Intelligence Artificielle avancée</strong>, je peux :<br>
• 🎯 <strong>Recommandations personnalisées</strong> basées sur vos préférences<br>
• 🔗 Trouver des <strong>produits similaires</strong> à ceux que vous aimez<br>
• 🔥 Vous montrer les <strong>produits populaires</strong><br>
• 🔍 Rechercher par catégorie ou mot-clé<br><br>
<strong>Essayez :</strong> "<em>Donne-moi des recommandations IA</em>" ou cliquez sur un bouton ci-dessous !`,
    timestamp: new Date(),
  };

  constructor(
    private chatbotService: ChatbotService,
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {
    this.categories = this.productService.getCategories();
    this.messages = [this.welcomeMessage];
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  openChat(): void {
    this.isOpen = true;
    
    const query = sessionStorage.getItem('chatbotQuery');
    if (query) {
      sessionStorage.removeItem('chatbotQuery');
      setTimeout(() => {
        this.input = query;
        this.handleSend();
      }, 300);
    }
  }

  closeChat(): void {
    this.isOpen = false;
  }

  clearChat(): void {
    this.messages = [this.welcomeMessage];
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  }

  browseCategory(category: Category): void {
    this.input = `Montre-moi les produits ${category.name}`;
    this.handleSend();
  }

  sendQuickAction(action: string): void {
    const actionMap: Record<string, string> = {
      '🤖 Recommandations IA': 'Donne-moi des recommandations personnalisées avec l\'IA',
      '🔥 Produits populaires': 'Montre-moi les produits populaires',
      '🔍 Chercher un produit': 'Je voudrais chercher un produit',
      '📦 Suivre ma commande': 'Où en est ma commande ?',
      '❓ Comment ça marche ?': 'Comment puis-tu m\'aider ?'
    };
    this.input = actionMap[action] || action;
    this.handleSend();
  }

  handleSend(): void {
    if (!this.input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: this.input,
      timestamp: new Date(),
    };

    this.messages = [...this.messages, userMessage];
    const userInput = this.input;
    this.input = '';
    this.isLoading = true;

    const processingTime = 800 + Math.random() * 700;
    
    setTimeout(async () => {
      const nlpResult = this.chatbotService.analyzeMessage(userInput);
      
      if (nlpResult.intent === 'recommendation') {
        try {
          const aiResponse = await this.chatbotService.getAIRecommendations(4);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: aiResponse.text,
            timestamp: new Date(),
            products: aiResponse.products,
            intent: 'recommendation'
          };
          this.messages = [...this.messages, botMessage];
          this.isLoading = false;
          return;
        } catch (error) {
          console.warn('AI recommendations failed, using fallback:', error);
        }
      }
      
      const similarMatch = userInput.match(/similaire[s]?\s+(?:à|au|a)?\s*(?:produit)?\s*#?(\d+)/i) ||
                          userInput.match(/produit[s]?\s+similaire[s]?\s+(?:à|au|a)?\s*#?(\d+)/i);
      if (similarMatch) {
        try {
          const productId = parseInt(similarMatch[1]);
          const aiResponse = await this.chatbotService.getAISimilarProducts(productId, 4);
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'bot',
            content: aiResponse.text,
            timestamp: new Date(),
            products: aiResponse.products,
            intent: 'recommendation'
          };
          this.messages = [...this.messages, botMessage];
          this.isLoading = false;
          return;
        } catch (error) {
          console.warn('Similar products failed:', error);
        }
      }
      
      const response = this.chatbotService.generateResponse(nlpResult);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.text,
        timestamp: new Date(),
        products: response.products,
        category: response.category,
        intent: nlpResult.intent
      };
      
      this.messages = [...this.messages, botMessage];
      this.isLoading = false;
    }, processingTime);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product);
    
    const confirmMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: `✅ <strong>${product.name}</strong> a été ajouté à votre panier !<br><br>
<a href="/cart" class="text-primary underline">Voir le panier →</a>`,
      timestamp: new Date()
    };
    this.messages = [...this.messages, confirmMessage];
  }

  viewProduct(product: Product): void {
    this.router.navigate(['/products', product.id]);
    this.isOpen = false;
  }

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      try {
        this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }
}
