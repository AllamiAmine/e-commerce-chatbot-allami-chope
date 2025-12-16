import { Injectable, inject } from '@angular/core';
import { Product, Category, NLPResult, ChatIntent } from '../models/product.model';
import { ProductService } from './product.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private productService = inject(ProductService);
  private apiService = inject(ApiService);
  private authService = inject(AuthService);
  
  private useBackend = true;

  /**
   * Envoie un message au chatbot (backend ou local)
   */
  async sendMessage(message: string): Promise<{ text: string; products?: Product[]; category?: Category; suggestions?: string[] }> {
    if (this.useBackend) {
      try {
        const user = this.authService.user();
        const userId = user ? parseInt(user.id) : undefined;
        
        const response = await firstValueFrom(this.apiService.sendChatMessage(message, userId));
        
        if (response.success && response.data) {
          const data = response.data;
          return {
            text: data.text || 'Je suis là pour vous aider !',
            products: data.products,
            suggestions: data.suggestions
          };
        }
      } catch (error) {
        console.warn('Backend chatbot failed, using local NLP:', error);
      }
    }

    // Fallback to local NLP
    const nlpResult = this.analyzeMessage(message);
    return this.generateResponse(nlpResult);
  }

  /**
   * Analyse NLP du message utilisateur
   * Détecte l'intention et extrait les entités
   */
  analyzeMessage(input: string): NLPResult {
    const normalizedInput = input.toLowerCase().trim();
    const words = normalizedInput.split(/\s+/);
    
    const intentScores = this.calculateIntentScores(normalizedInput, words);
    const bestIntent = this.getBestIntent(intentScores);
    const entities = this.extractEntities(normalizedInput, words);
    
    return {
      intent: bestIntent.intent,
      entities,
      confidence: bestIntent.score
    };
  }

  /**
   * Génère une réponse intelligente basée sur l'analyse NLP
   */
  generateResponse(nlpResult: NLPResult): { text: string; products?: Product[]; category?: Category; suggestions?: string[] } {
    const { intent, entities } = nlpResult;
    
    switch (intent) {
      case 'greeting':
        return this.handleGreeting();
      case 'product_search':
        return this.handleProductSearch(entities);
      case 'category_browse':
        return this.handleCategoryBrowse(entities);
      case 'recommendation':
        return this.handleRecommendation(entities);
      case 'order_status':
        return this.handleOrderStatus();
      case 'delivery_tracking':
        return this.handleDeliveryTracking();
      case 'price_inquiry':
        return this.handlePriceInquiry(entities);
      case 'help':
        return this.handleHelp();
      case 'payment':
        return this.handlePayment();
      case 'return':
        return this.handleReturn();
      case 'thanks':
        return this.handleThanks();
      case 'add_to_cart':
        return this.handleAddToCart(entities);
      default:
        return this.handleUnknown(entities);
    }
  }

  private calculateIntentScores(input: string, words: string[]): Map<ChatIntent, number> {
    const scores = new Map<ChatIntent, number>();
    
    const intentPatterns: { intent: ChatIntent; patterns: string[]; weight: number }[] = [
      { intent: 'greeting', patterns: ['bonjour', 'salut', 'hello', 'hey', 'coucou', 'bonsoir', 'hi', 'salam'], weight: 1.5 },
      { intent: 'product_search', patterns: ['cherche', 'recherche', 'trouve', 'trouver', 'où', 'avoir', 'acheter', 'besoin', 'veux', 'voudrais', 'montre', 'écouteur', 'caméra'], weight: 1.2 },
      { intent: 'category_browse', patterns: ['catégorie', 'categories', 'électronique', 'accessoires', 'maison', 'mode', 'sports', 'beauté'], weight: 1.3 },
      { intent: 'recommendation', patterns: ['recommand', 'suggér', 'conseil', 'proposer', 'idée', 'meilleur', 'populaire', 'tendance'], weight: 1.4 },
      { intent: 'order_status', patterns: ['commande', 'commandes', 'mes commandes', 'historique', 'statut'], weight: 1.3 },
      { intent: 'delivery_tracking', patterns: ['livraison', 'suivre', 'suivi', 'tracking', 'colis', 'expédition'], weight: 1.3 },
      { intent: 'price_inquiry', patterns: ['prix', 'coût', 'combien', 'tarif', 'promotion', 'solde', 'réduction'], weight: 1.2 },
      { intent: 'help', patterns: ['aide', 'help', 'problème', 'question', 'support', 'comment'], weight: 1.1 },
      { intent: 'payment', patterns: ['paiement', 'carte', 'payer', 'cb', 'paypal', 'visa'], weight: 1.2 },
      { intent: 'return', patterns: ['retour', 'rembours', 'échanger', 'annuler'], weight: 1.2 },
      { intent: 'thanks', patterns: ['merci', 'super', 'parfait', 'génial', 'excellent'], weight: 1.5 },
      { intent: 'add_to_cart', patterns: ['ajouter', 'panier', 'acheter', 'commander'], weight: 1.1 }
    ];

    for (const { intent, patterns, weight } of intentPatterns) {
      let score = 0;
      for (const pattern of patterns) {
        if (input.includes(pattern)) {
          score += weight;
        }
      }
      scores.set(intent, score);
    }

    return scores;
  }

  private getBestIntent(scores: Map<ChatIntent, number>): { intent: ChatIntent; score: number } {
    let bestIntent: ChatIntent = 'unknown';
    let bestScore = 0;

    scores.forEach((score, intent) => {
      if (score > bestScore) {
        bestScore = score;
        bestIntent = intent;
      }
    });

    return { intent: bestIntent, score: bestScore };
  }

  private extractEntities(input: string, words: string[]): NLPResult['entities'] {
    const categories = this.productService.getCategories();
    
    let detectedCategory: string | undefined;
    let detectedProduct: string | undefined;
    const keywords: string[] = [];

    const categoryKeywords: Record<string, string[]> = {
      'Électronique': ['électronique', 'tech', 'gadget', 'écouteur', 'montre', 'caméra', 'drone', 'bluetooth'],
      'Accessoires': ['accessoire', 'câble', 'batterie', 'chargeur', 'support', 'housse'],
      'Maison': ['maison', 'lampe', 'thermostat', 'sonnette', 'connecté', 'smart home'],
      'Mode': ['mode', 'sac', 'lunettes', 'portefeuille', 'ceinture'],
      'Sports': ['sport', 'ballon', 'football', 'tennis', 'fitness'],
      'Beauté': ['beauté', 'maquillage', 'sérum', 'cosmétique', 'soin']
    };

    for (const [categoryName, catKeywords] of Object.entries(categoryKeywords)) {
      for (const keyword of catKeywords) {
        if (input.includes(keyword)) {
          detectedCategory = categoryName;
          keywords.push(keyword);
          break;
        }
      }
      if (detectedCategory) break;
    }

    const priceMatch = input.match(/(\d+)\s*(mad|dh|dirhams?)?/i);
    let priceRange: { min?: number; max?: number } | undefined;
    if (priceMatch) {
      const price = parseInt(priceMatch[1]);
      if (input.includes('moins') || input.includes('max') || input.includes('budget')) {
        priceRange = { max: price };
      } else if (input.includes('plus') || input.includes('min')) {
        priceRange = { min: price };
      }
    }

    return { category: detectedCategory, productName: detectedProduct, priceRange, keywords };
  }

  // Response handlers
  private handleGreeting(): { text: string; suggestions?: string[] } {
    const greetings = [
      `Bonjour ! 😊 Ravi de vous voir sur ShopAI. Je suis votre assistant intelligent, prêt à vous aider.<br><br>Que recherchez-vous ?`,
      `Salut ! 👋 Bienvenue sur ShopAI ! Comment puis-je vous aider ?`,
      `Hello ! 🌟 Je suis l'Assistant IA ShopAI. Dites-moi ce que vous cherchez !`
    ];
    return { 
      text: greetings[Math.floor(Math.random() * greetings.length)],
      suggestions: ['Voir les produits', 'Recommandations', 'Mes commandes']
    };
  }

  private handleProductSearch(entities: NLPResult['entities']): { text: string; products?: Product[]; suggestions?: string[] } {
    let products: Product[] = [];
    let text = '';

    if (entities.category) {
      const category = this.productService.getCategories().find(
        c => c.name.toLowerCase() === entities.category?.toLowerCase()
      );
      if (category) {
        products = this.productService.getProductsByCategory(category.id);
        text = `🔍 <strong>Résultats pour "${entities.category}"</strong><br><br>J'ai trouvé ${products.length} produits :`;
      }
    } else if (entities.keywords.length > 0) {
      products = this.productService.searchProducts(entities.keywords.join(' '));
      text = products.length > 0 
        ? `🔍 J'ai trouvé ${products.length} produit(s) :`
        : `🤔 Aucun résultat, mais voici des suggestions :`;
      if (products.length === 0) {
        products = this.productService.getTopRatedProducts(4);
      }
    } else {
      products = this.productService.getProducts().slice(0, 4);
      text = `🔍 <strong>Nos produits vedettes</strong>`;
    }

    return { text, products: products.slice(0, 4), suggestions: ['Plus de produits', 'Catégories'] };
  }

  private handleCategoryBrowse(entities: NLPResult['entities']): { text: string; products?: Product[]; category?: Category; suggestions?: string[] } {
    const categories = this.productService.getCategories();
    
    if (entities.category) {
      const category = categories.find(c => c.name.toLowerCase() === entities.category?.toLowerCase());
      if (category) {
        const products = this.productService.getProductsByCategory(category.id);
        return {
          text: `${category.icon} <strong>Catégorie ${category.name}</strong><br><br>Découvrez ${products.length} produits :`,
          products: products.slice(0, 4),
          category
        };
      }
    }

    const categoryList = categories.map(c => `${c.icon} ${c.name}`).join('<br>');
    return {
      text: `📂 <strong>Nos catégories :</strong><br><br>${categoryList}`,
      suggestions: categories.map(c => c.name)
    };
  }

  private handleRecommendation(entities: NLPResult['entities']): { text: string; products?: Product[]; suggestions?: string[] } {
    const products = this.productService.getTopRatedProducts(4);
    return {
      text: `💡 <strong>Recommandations</strong><br><br>Voici nos produits les mieux notés :`,
      products,
      suggestions: ['Voir plus', 'Promotions']
    };
  }

  private handleOrderStatus(): { text: string; suggestions?: string[] } {
    return {
      text: `📦 <strong>Vos commandes récentes :</strong><br><br>
• <strong>Commande #12458</strong> - En cours de livraison 🚚<br>
• <strong>Commande #12445</strong> - Livrée ✅<br><br>
Voulez-vous plus de détails ?`,
      suggestions: ['Détails commande', 'Suivre livraison']
    };
  }

  private handleDeliveryTracking(): { text: string; suggestions?: string[] } {
    return {
      text: `🚚 <strong>Suivi de livraison</strong><br><br>
📦 Commande #12458<br>
📍 Statut: En transit<br>
🏢 Centre de distribution Casablanca<br>
📅 Livraison prévue: Demain avant 18h`,
      suggestions: ['Contacter support', 'Autre commande']
    };
  }

  private handlePriceInquiry(entities: NLPResult['entities']): { text: string; products?: Product[]; suggestions?: string[] } {
    let products = this.productService.getProducts();
    
    if (entities.priceRange?.max) {
      products = products.filter(p => p.price <= entities.priceRange!.max!);
      return {
        text: `💰 <strong>Produits à moins de ${entities.priceRange.max} MAD</strong>`,
        products: products.slice(0, 4),
        suggestions: ['Promotions', 'Moins cher']
      };
    }

    return {
      text: `💰 <strong>Offres actuelles</strong><br><br>🔥 -20% sur l'électronique<br>🎁 Livraison gratuite dès 500 MAD`,
      products: this.productService.getPromotionalProducts().slice(0, 4),
      suggestions: ['Voir promotions', 'Meilleures ventes']
    };
  }

  private handleHelp(): { text: string; suggestions?: string[] } {
    return {
      text: `🤝 <strong>Comment puis-je vous aider ?</strong><br><br>
🔍 Recherche de produits<br>
📂 Explorer les catégories<br>
💡 Recommandations<br>
📦 Suivi de commandes<br>
💳 Informations paiement`,
      suggestions: ['Produits', 'Commandes', 'Paiement']
    };
  }

  private handlePayment(): { text: string; suggestions?: string[] } {
    return {
      text: `💳 <strong>Modes de paiement</strong><br><br>
• Carte bancaire (Visa, Mastercard)<br>
• PayPal<br>
• Paiement à la livraison<br>
• Virement bancaire<br><br>
🔒 Paiements 100% sécurisés`,
      suggestions: ['Commander', 'Aide']
    };
  }

  private handleReturn(): { text: string; suggestions?: string[] } {
    return {
      text: `🔄 <strong>Politique de retour</strong><br><br>
✅ Retour gratuit sous 30 jours<br>
✅ Remboursement sous 5-7 jours<br>
✅ Échange possible`,
      suggestions: ['Retourner un produit', 'Contact']
    };
  }

  private handleThanks(): { text: string; suggestions?: string[] } {
    const responses = [
      `De rien ! 😊 Bonne journée sur ShopAI ! 🛍️`,
      `Avec plaisir ! 🌟 Je suis là 24h/24.`,
      `Merci à vous ! 😄 À bientôt !`
    ];
    return { 
      text: responses[Math.floor(Math.random() * responses.length)],
      suggestions: ['Voir produits', 'Accueil']
    };
  }

  private handleAddToCart(entities: NLPResult['entities']): { text: string; products?: Product[]; suggestions?: string[] } {
    return {
      text: `🛒 Pour ajouter un produit, cliquez sur le bouton "Ajouter" sur la carte du produit.`,
      products: this.productService.getProducts().slice(0, 4),
      suggestions: ['Voir panier', 'Continuer']
    };
  }

  private handleUnknown(entities: NLPResult['entities']): { text: string; products?: Product[]; suggestions?: string[] } {
    return {
      text: `🤔 Je ne suis pas sûr de comprendre. Voici ce que je peux faire :<br><br>
• 🔍 Rechercher des produits<br>
• 📂 Explorer les catégories<br>
• 💡 Recommandations<br>
• 📦 Suivre commandes`,
      products: this.productService.getTopRatedProducts(4),
      suggestions: ['Produits', 'Aide', 'Catégories']
    };
  }

  // Toggle backend mode
  setBackendMode(enabled: boolean): void {
    this.useBackend = enabled;
  }
}
