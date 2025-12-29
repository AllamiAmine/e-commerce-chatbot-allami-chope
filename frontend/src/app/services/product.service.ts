import { Injectable, inject, signal } from '@angular/core';
import { Product, Category } from '../models/product.model';
import { ApiService } from './api.service';
import { firstValueFrom } from 'rxjs';
import { AMAZON_PRODUCTS, AMAZON_CATEGORIES } from '../data/amazon-products';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiService = inject(ApiService);
  
  // Signals for reactive data
  private productsSignal = signal<Product[]>([]);
  private categoriesSignal = signal<Category[]>([]);
  private loadingSignal = signal<boolean>(false);
  private useBackend = signal<boolean>(false); // Use static Amazon data by default

  // Static fallback data - Amazon products
  private staticProducts: Product[] = AMAZON_PRODUCTS;
  
  // Legacy static products (kept for reference)
  private legacyProducts: Product[] = [
    {
      id: 1,
      name: 'Écouteurs Bluetooth Premium',
      price: 1499.9,
      image: 'assets/wireless-headphones.jpg',
      rating: 4.8,
      reviews: 328,
      badge: 'Populaire',
      categoryId: 1,
      description: 'Écouteurs sans fil avec réduction de bruit active et autonomie de 30h.'
    },
    {
      id: 2,
      name: 'Montre Intelligente Ultra',
      price: 2999.9,
      image: 'assets/modern-smartwatch.png',
      rating: 4.6,
      reviews: 245,
      badge: 'Nouveau',
      categoryId: 1,
      description: 'Smartwatch avec GPS, moniteur cardiaque et écran AMOLED.'
    },
    {
      id: 3,
      name: 'Caméra Numérique 4K',
      price: 5999.9,
      image: 'assets/4k-camera.jpg',
      rating: 4.9,
      reviews: 512,
      badge: null,
      categoryId: 1,
      description: 'Caméra professionnelle 4K avec stabilisation optique.'
    },
    {
      id: 4,
      name: 'Drone 4K Professionnel',
      price: 7499.9,
      image: 'assets/4k-drone.jpg',
      rating: 4.8,
      reviews: 210,
      badge: 'Premium',
      categoryId: 1,
      description: 'Drone 4K avec stabilisation avancée et autonomie de 40 minutes.'
    },
    {
      id: 5,
      name: 'Enceinte Portable Bluetooth',
      price: 899.9,
      image: 'assets/portable-speaker.jpg',
      rating: 4.6,
      reviews: 310,
      badge: 'Populaire',
      categoryId: 1,
      description: 'Enceinte sans fil compacte avec basses puissantes et résistance à l’eau.'
    },
    {
      id: 6,
      name: 'Casque Audio Confort Pro',
      price: 1699.9,
      image: 'assets/headphones-angle.jpg',
      rating: 4.7,
      reviews: 190,
      badge: null,
      categoryId: 1,
      description: 'Casque circum-aural avec isolation phonique et coussinets mémoire de forme.'
    },
    {
      id: 7,
      name: 'Batterie Externe 100W',
      price: 799.9,
      image: 'assets/power-bank.jpg',
      rating: 4.7,
      reviews: 189,
      badge: 'En promotion',
      categoryId: 2,
      description: 'Power bank haute capacité avec charge rapide 100W.'
    },
    {
      id: 8,
      name: 'Câble USB-C Premium',
      price: 299.9,
      image: 'assets/usb-c-cable.jpg',
      rating: 4.5,
      reviews: 156,
      badge: null,
      categoryId: 2,
      description: 'Câble tressé USB-C haute vitesse, 2m.'
    },
    {
      id: 9,
      name: 'Support Téléphone Ajustable',
      price: 199.9,
      image: 'assets/minimalist-wooden-phone-stand.png',
      rating: 4.3,
      reviews: 92,
      badge: null,
      categoryId: 2,
      description: 'Support en bois naturel pour smartphone et tablette.'
    },
    {
      id: 10,
      name: 'Coque Protectrice Renforcée',
      price: 149.9,
      image: 'assets/protective-case.jpg',
      rating: 4.4,
      reviews: 135,
      badge: null,
      categoryId: 2,
      description: 'Coque antichoc pour smartphone avec bords renforcés.'
    },
    {
      id: 11,
      name: 'Protection Écran Verre Trempé',
      price: 99.9,
      image: 'assets/screen-protector.png',
      rating: 4.5,
      reviews: 260,
      badge: 'Best price',
      categoryId: 2,
      description: 'Verre trempé ultra-fin avec protection anti-rayures.'
    },
    {
      id: 12,
      name: 'Portefeuille RFID Sécurisé',
      price: 249.9,
      image: 'assets/rfid-wallet.jpg',
      rating: 4.6,
      reviews: 175,
      badge: null,
      categoryId: 2,
      description: 'Portefeuille compact avec protection RFID contre le vol de données.'
    },
    {
      id: 13,
      name: 'Lampe LED Intelligente',
      price: 499.9,
      image: 'assets/smart-led-lamp.jpg',
      rating: 4.6,
      reviews: 234,
      badge: 'Nouveau',
      categoryId: 3,
      description: 'Lampe connectée avec 16 millions de couleurs.'
    },
    {
      id: 14,
      name: 'Thermostat Connecté',
      price: 1999.9,
      image: 'assets/smart-thermostat.jpg',
      rating: 4.8,
      reviews: 421,
      badge: null,
      categoryId: 3,
      description: 'Thermostat intelligent avec contrôle via application.'
    },
    {
      id: 15,
      name: 'Serrure Intelligente Sécurisée',
      price: 1599.9,
      image: 'assets/smart-lock.jpg',
      rating: 4.5,
      reviews: 140,
      badge: null,
      categoryId: 3,
      description: 'Serrure connectée avec ouverture via smartphone et code PIN.'
    },
    {
      id: 16,
      name: 'Détecteur de Fumée Connecté',
      price: 399.9,
      image: 'assets/smoke-detector.jpg',
      rating: 4.4,
      reviews: 120,
      badge: null,
      categoryId: 3,
      description: 'Détecteur de fumée intelligent avec alertes en temps réel.'
    },
    {
      id: 17,
      name: 'Montre de Luxe',
      price: 2499.9,
      image: 'assets/luxury-watch.jpg',
      rating: 4.9,
      reviews: 567,
      badge: 'Populaire',
      categoryId: 4,
      description: 'Montre classique avec bracelet en cuir italien.'
    },
    {
      id: 18,
      name: 'Sac à Dos Urbain',
      price: 899.9,
      image: 'assets/urban-backpack.jpg',
      rating: 4.6,
      reviews: 289,
      badge: null,
      categoryId: 4,
      description: 'Sac à dos imperméable avec compartiment laptop.'
    },
    {
      id: 19,
      name: 'Ceinture Cuir Élégante',
      price: 349.9,
      image: 'assets/leather-belt.jpg',
      rating: 4.5,
      reviews: 98,
      badge: null,
      categoryId: 4,
      description: 'Ceinture en cuir véritable avec boucle métallique premium.'
    },
    {
      id: 20,
      name: 'Lunettes de Soleil Premium',
      price: 1299.9,
      image: 'assets/premium-sunglasses.jpg',
      rating: 4.7,
      reviews: 201,
      badge: null,
      categoryId: 4,
      description: 'Lunettes polarisées avec protection UV400.'
    },
    {
      id: 21,
      name: 'Ballon de Football Pro',
      price: 399.9,
      image: 'assets/soccer-ball.jpg',
      rating: 4.6,
      reviews: 180,
      badge: null,
      categoryId: 5,
      description: 'Ballon de football taille 5 avec revêtement résistant.'
    },
    {
      id: 22,
      name: 'Raquette de Tennis Graphite',
      price: 699.9,
      image: 'assets/tennis-racket.jpg',
      rating: 4.7,
      reviews: 145,
      badge: 'Nouveau',
      categoryId: 5,
      description: 'Raquette légère en graphite pour joueurs intermédiaires.'
    },
    {
      id: 23,
      name: 'Gants de Boxe Entraînement',
      price: 499.9,
      image: 'assets/boxing-gloves.jpg',
      rating: 4.5,
      reviews: 110,
      badge: null,
      categoryId: 5,
      description: 'Gants de boxe rembourrés pour entraînement intensif.'
    },
    {
      id: 24,
      name: 'iPhone 17 Pro Max 1 To',
      price: 13999.9,
      image: 'assets/smartwatch-angle.jpg',
      rating: 4.9,
      reviews: 87,
      badge: 'Nouveau',
      categoryId: 1,
      description: 'Dernière génération d’iPhone avec puce A17 Pro et autonomie améliorée.'
    },
    {
      id: 25,
      name: 'iPhone 17 Pro Max Titanium',
      price: 14999.9,
      image: 'assets/smartwatch-detail.jpg',
      rating: 5.0,
      reviews: 42,
      badge: 'Premium',
      categoryId: 1,
      description: 'Finition titane, stockage 1 To et appareil photo Pro pour les créateurs exigeants.'
    },
    {
      id: 26,
      name: 'Galaxy Z Fold 6',
      price: 12999.9,
      image: 'assets/camera-angle.jpg',
      rating: 4.7,
      reviews: 65,
      badge: 'Nouveau',
      categoryId: 1,
      description: 'Smartphone pliable avec grand écran AMOLED et multitâche avancé.'
    },
    {
      id: 27,
      name: 'Huawei MatePad Pro 13.2',
      price: 7999.9,
      image: 'assets/camera-detail.jpg',
      rating: 4.6,
      reviews: 54,
      badge: 'En promotion',
      categoryId: 1,
      description: 'Tablette OLED haute performance idéale pour le travail et le divertissement.'
    },
    {
      id: 28,
      name: 'Bravia XR A95L 55" QD‑OLED',
      price: 20999.9,
      image: 'assets/video-doorbell.jpg',
      rating: 4.9,
      reviews: 31,
      badge: 'Premium',
      categoryId: 1,
      description: 'TV QD‑OLED avec couleurs spectaculaires et son immersif pour home‑cinéma.'
    },
    {
      id: 29,
      name: 'MacBook Air 13" M4',
      price: 10999.9,
      image: 'assets/tangled-cables.png',
      rating: 4.8,
      reviews: 73,
      badge: 'Populaire',
      categoryId: 1,
      description: 'Ultrabook léger avec puce M4, idéal pour la productivité et la création.'
    },
    {
      id: 30,
      name: 'Lenovo ThinkPad X1 Carbon Gen 13',
      price: 17999.0,
      image: 'assets/placeholder.jpg',
      rating: 4.9,
      reviews: 44,
      badge: 'Best seller',
      categoryId: 1,
      description: 'Ultrabook professionnel 14" OLED avec processeur Intel Core Ultra 9 et 32 Go de RAM.'
    },
    {
      id: 31,
      name: 'Alienware m16 R3 Gaming Laptop',
      price: 23999.9,
      image: 'assets/placeholder.svg',
      rating: 4.7,
      reviews: 29,
      badge: 'Flash',
      categoryId: 1,
      description: 'PC portable gaming haute performance avec GPU dédié et écran 240 Hz.'
    },
    {
      id: 32,
      name: 'AirPods Pro 3',
      price: 2499.99,
      image: 'assets/headphones-detail.jpg',
      rating: 4.8,
      reviews: 320,
      badge: 'En promotion',
      categoryId: 1,
      description: 'Écouteurs sans fil avec réduction de bruit active et audio spatial.'
    },
    {
      id: 33,
      name: 'Xiaomi 14 Pro',
      price: 9999.9,
      image: 'assets/camera-detail.jpg',
      rating: 4.6,
      reviews: 58,
      badge: 'Nouveau',
      categoryId: 1,
      description: 'Smartphone premium avec capteur photo avancé et charge ultra‑rapide.'
    },
    {
      id: 34,
      name: 'Pura 70 Ultra',
      price: 11999.9,
      image: 'assets/camera-angle.jpg',
      rating: 4.7,
      reviews: 39,
      badge: 'Flash',
      categoryId: 1,
      description: 'Smartphone photo‑centric avec capteur périscope pour des clichés ultra détaillés.'
    },
    {
      id: 35,
      name: 'Sony WH‑1000XM6',
      price: 4999.9,
      image: 'assets/headphones-angle.jpg',
      rating: 4.9,
      reviews: 412,
      badge: 'Top',
      categoryId: 1,
      description: 'Casque à réduction de bruit de référence, idéal pour le voyage et le travail.'
    },
    {
      id: 36,
      name: 'PlayStation 5 Slim',
      price: 7499.9,
      image: 'assets/video-doorbell.jpg',
      rating: 4.8,
      reviews: 260,
      badge: 'Populaire',
      categoryId: 1,
      description: 'Console next‑gen pour une expérience de jeu fluide en 4K HDR.'
    },
    {
      id: 37,
      name: 'Station de Charge 3‑en‑1',
      price: 799.9,
      image: 'assets/tangled-cables.png',
      rating: 4.4,
      reviews: 90,
      badge: 'Best price',
      categoryId: 2,
      description: 'Station de charge sans fil pour iPhone, Apple Watch et AirPods.'
    },
    {
      id: 38,
      name: 'Enceinte Connectée Smart Home',
      price: 1299.9,
      image: 'assets/portable-speaker.jpg',
      rating: 4.5,
      reviews: 112,
      badge: null,
      categoryId: 3,
      description: 'Enceinte intelligente avec assistant vocal intégré et son 360°.'
    },
    {
      id: 39,
      name: 'Pack Accessoires Premium iPhone',
      price: 999.9,
      image: 'assets/protective-case.jpg',
      rating: 4.6,
      reviews: 150,
      badge: 'En promotion',
      categoryId: 2,
      description: 'Coque, verre trempé et câble tressé USB‑C pour protéger et charger votre iPhone.'
    },
    {
      id: 40,
      name: 'Kit Smart Home Sécurité',
      price: 2599.9,
      image: 'assets/smart-lock.jpg',
      rating: 4.5,
      reviews: 77,
      badge: 'Pack',
      categoryId: 3,
      description: 'Pack complet incluant serrure intelligente, détecteur de fumée et sonnette vidéo.'
    }
  ];

  private staticCategories: Category[] = AMAZON_CATEGORIES;

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData(): Promise<void> {
    if (this.productsSignal().length > 0) {
      return; // Already loaded
    }
    
    if (this.useBackend()) {
      await this.loadFromBackend();
    } else {
      this.productsSignal.set(this.staticProducts);
      this.categoriesSignal.set(this.staticCategories);
    }
  }
  
  // Public method to ensure data is loaded
  async ensureDataLoaded(): Promise<void> {
    await this.loadInitialData();
  }

  private async loadFromBackend(): Promise<void> {
    this.loadingSignal.set(true);
    try {
      // Load products
      const productsResponse = await firstValueFrom(this.apiService.getProducts());
      if (productsResponse.success && productsResponse.data) {
        this.productsSignal.set(productsResponse.data);
      } else {
        this.productsSignal.set(this.staticProducts);
      }

      // Load categories
      const categoriesResponse = await firstValueFrom(this.apiService.getCategories());
      if (categoriesResponse.success && categoriesResponse.data) {
        this.categoriesSignal.set(categoriesResponse.data);
      } else {
        this.categoriesSignal.set(this.staticCategories);
      }
    } catch (error) {
      console.warn('Failed to load from backend, using static data:', error);
      this.productsSignal.set(this.staticProducts);
      this.categoriesSignal.set(this.staticCategories);
    } finally {
      this.loadingSignal.set(false);
    }
  }

  // Refresh data from backend
  async refreshData(): Promise<void> {
    await this.loadFromBackend();
  }

  getProducts(): Product[] {
    return this.productsSignal();
  }

  getProductById(id: number): Product | undefined {
    // First check in loaded products signal
    const product = this.productsSignal().find(p => p.id === id);
    if (product) {
      return product;
    }
    
    // Fallback to static products if signal is empty
    if (this.productsSignal().length === 0) {
      return this.staticProducts.find(p => p.id === id);
    }
    
    return undefined;
  }

  async getProductByIdAsync(id: number): Promise<Product | undefined> {
    // Ensure products are loaded first
    await this.ensureDataLoaded();
    
    if (this.useBackend()) {
      try {
        const response = await firstValueFrom(this.apiService.getProductById(id));
        if (response.success && response.data) {
          return response.data;
        }
      } catch (error) {
        console.warn('Failed to load product from backend:', error);
      }
    }
    
    // Fallback to local search
    return this.getProductById(id);
  }

  getCategories(): Category[] {
    return this.categoriesSignal();
  }

  getCategoryById(id: number): Category | undefined {
    return this.categoriesSignal().find(c => c.id === id);
  }

  getProductsByCategory(categoryId: number): Product[] {
    return this.productsSignal().filter(p => p.categoryId === categoryId);
  }

  async getProductsByCategoryAsync(categoryId: number): Promise<Product[]> {
    if (this.useBackend()) {
      try {
        const response = await firstValueFrom(this.apiService.getProductsByCategory(categoryId));
        if (response.success && response.data) {
          return response.data;
        }
      } catch (error) {
        console.warn('Failed to load products by category from backend:', error);
      }
    }
    return this.getProductsByCategory(categoryId);
  }

  getAllProductsFlat(): Product[] {
    return this.productsSignal();
  }

  searchProducts(query: string): Product[] {
    const normalizedQuery = query.toLowerCase();
    return this.productsSignal().filter(product =>
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.description?.toLowerCase().includes(normalizedQuery)
    );
  }

  async searchProductsAsync(query: string): Promise<Product[]> {
    if (this.useBackend()) {
      try {
        const response = await firstValueFrom(this.apiService.searchProducts(query));
        if (response.success && response.data) {
          return response.data;
        }
      } catch (error) {
        console.warn('Failed to search products from backend:', error);
      }
    }
    return this.searchProducts(query);
  }

  getProductsByPriceRange(min: number, max: number): Product[] {
    return this.productsSignal().filter(
      product => product.price >= min && product.price <= max
    );
  }

  getTopRatedProducts(limit: number = 4): Product[] {
    return [...this.productsSignal()]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit);
  }

  async getTopRatedProductsAsync(limit: number = 4): Promise<Product[]> {
    if (this.useBackend()) {
      try {
        const response = await firstValueFrom(this.apiService.getTopRatedProducts());
        if (response.success && response.data) {
          return response.data.slice(0, limit);
        }
      } catch (error) {
        console.warn('Failed to load top rated products from backend:', error);
      }
    }
    return this.getTopRatedProducts(limit);
  }

  getPromotionalProducts(): Product[] {
    return this.productsSignal().filter(
      product => product.badge === 'En promotion' || product.badge === 'Populaire'
    );
  }

  async getPromotionalProductsAsync(): Promise<Product[]> {
    if (this.useBackend()) {
      try {
        const response = await firstValueFrom(this.apiService.getPromotionalProducts());
        if (response.success && response.data) {
          return response.data;
        }
      } catch (error) {
        console.warn('Failed to load promotional products from backend:', error);
      }
    }
    return this.getPromotionalProducts();
  }

  // Toggle backend mode
  setBackendMode(enabled: boolean): void {
    this.useBackend.set(enabled);
    this.loadInitialData();
  }

  isLoading(): boolean {
    return this.loadingSignal();
  }
}
