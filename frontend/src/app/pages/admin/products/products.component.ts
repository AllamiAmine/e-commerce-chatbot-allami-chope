import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ProductService } from '../../../services/product.service';
import { ApiService } from '../../../services/api.service';
import { Product, Category } from '../../../models/product.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-admin-products',
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
                🛍️ Gestion des Produits
              </h1>
            </div>
            <button 
              (click)="openAddModal()"
              class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              <span class="hidden sm:inline">Ajouter un produit</span>
            </button>
          </div>
        </div>
      </header>

      <div class="container mx-auto px-4 py-8">
        <!-- Filters -->
        <div class="bg-background rounded-2xl border border-border p-4 mb-6">
          <div class="flex flex-col lg:flex-row gap-4">
            <div class="flex-1 relative">
              <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                placeholder="Rechercher un produit..."
                class="w-full pl-12 pr-4 py-3 border border-input rounded-xl bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <select
              [(ngModel)]="filterCategory"
              class="px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              @for (category of categories; track category.id) {
                <option [value]="category.id">{{ category.icon }} {{ category.name }}</option>
              }
            </select>
            <select
              [(ngModel)]="filterStock"
              class="px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Tout le stock</option>
              <option value="in">En stock</option>
              <option value="low">Stock bas (&lt;10)</option>
              <option value="out">Rupture</option>
            </select>
          </div>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-foreground">{{ products.length }}</p>
            <p class="text-sm text-muted-foreground">Total produits</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-green-600">{{ getInStockCount() }}</p>
            <p class="text-sm text-muted-foreground">En stock</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-orange-600">{{ getLowStockCount() }}</p>
            <p class="text-sm text-muted-foreground">Stock bas</p>
          </div>
          <div class="bg-background rounded-xl border border-border p-4">
            <p class="text-2xl font-bold text-red-600">{{ getOutOfStockCount() }}</p>
            <p class="text-sm text-muted-foreground">Rupture</p>
          </div>
        </div>

        <!-- Products Table -->
        <div class="bg-background rounded-2xl border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-muted/50 border-b border-border">
                <tr>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Produit</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground">Catégorie</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground hidden md:table-cell">Prix</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground hidden lg:table-cell">Stock</th>
                  <th class="text-left px-6 py-4 text-sm font-semibold text-foreground hidden lg:table-cell">Rating</th>
                  <th class="text-right px-6 py-4 text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (product of filteredProducts(); track product.id) {
                  <tr class="border-b border-border hover:bg-muted/30 transition-colors">
                    <td class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <img [src]="product.image" [alt]="product.name" class="w-12 h-12 rounded-lg object-cover" />
                        <div>
                          <p class="font-medium text-foreground">{{ product.name }}</p>
                          <p class="text-xs text-muted-foreground">ID: {{ product.id }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-muted">
                        {{ getCategoryName(product.categoryId) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 hidden md:table-cell">
                      <span class="font-semibold text-primary">{{ product.price.toFixed(2) }} MAD</span>
                    </td>
                    <td class="px-6 py-4 hidden lg:table-cell">
                      <span [class]="'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ' + getStockClass(product.stock || 0)">
                        <span [class]="'w-1.5 h-1.5 rounded-full ' + getStockDot(product.stock || 0)"></span>
                        {{ product.stock || 0 }}
                      </span>
                    </td>
                    <td class="px-6 py-4 hidden lg:table-cell">
                      <div class="flex items-center gap-1">
                        <svg class="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        <span class="text-sm text-foreground">{{ product.rating }}</span>
                        <span class="text-xs text-muted-foreground">({{ product.reviews }})</span>
                      </div>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-2">
                        <button 
                          (click)="editProduct(product)"
                          class="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Modifier"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                        <button 
                          (click)="duplicateProduct(product)"
                          class="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title="Dupliquer"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                          </svg>
                        </button>
                        <button 
                          (click)="deleteProduct(product)"
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
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Add/Edit Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" (click)="closeModal()">
          <div class="bg-background rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-xl font-bold text-foreground">
                {{ editingProduct() ? 'Modifier le produit' : 'Ajouter un produit' }}
              </h2>
              <button (click)="closeModal()" class="p-2 hover:bg-muted rounded-lg transition-colors">
                <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form (ngSubmit)="saveProduct()" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-foreground mb-2">Nom du produit *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.name"
                    name="name"
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Prix (MAD) *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.price"
                    name="price"
                    step="0.01"
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Stock *</label>
                  <input
                    type="number"
                    [(ngModel)]="formData.stock"
                    name="stock"
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Catégorie *</label>
                  <select
                    [(ngModel)]="formData.categoryId"
                    name="categoryId"
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    @for (category of categories; track category.id) {
                      <option [value]="category.id">{{ category.icon }} {{ category.name }}</option>
                    }
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-foreground mb-2">Badge</label>
                  <select
                    [(ngModel)]="formData.badge"
                    name="badge"
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Aucun</option>
                    <option value="Nouveau">Nouveau</option>
                    <option value="Populaire">Populaire</option>
                    <option value="Premium">Premium</option>
                    <option value="Promo">Promo</option>
                  </select>
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-foreground mb-2">URL de l'image</label>
                  <input
                    type="url"
                    [(ngModel)]="formData.image"
                    name="image"
                    placeholder="https://..."
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-foreground mb-2">Description</label>
                  <textarea
                    [(ngModel)]="formData.description"
                    name="description"
                    rows="3"
                    class="w-full px-4 py-3 border border-input rounded-xl bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  ></textarea>
                </div>
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
                  {{ editingProduct() ? 'Enregistrer' : 'Ajouter' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminProductsComponent implements OnInit {
  authService = inject(AuthService);
  private productService = inject(ProductService);
  private apiService = inject(ApiService);
  private router = inject(Router);

  searchQuery = '';
  filterCategory = '';
  filterStock = '';
  
  showModal = signal(false);
  editingProduct = signal<Product | null>(null);
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  products: Product[] = [];
  categories: Category[] = [];

  formData = {
    name: '',
    price: 0,
    stock: 0,
    categoryId: 1,
    badge: '',
    image: '',
    description: ''
  };

  constructor() {
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/']);
      return;
    }
  }

  ngOnInit(): void {
    this.loadProducts();
    this.categories = this.productService.getCategories();
  }

  async loadProducts(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const response = await firstValueFrom(this.apiService.getProducts());
      
      if (response.success && response.data) {
        this.products = response.data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=800&fit=crop&q=80',
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          badge: p.badge,
          categoryId: p.categoryId || p.category?.id,
          description: p.description,
          stock: p.stock || 0
        }));
        console.log('✅ Products loaded from MySQL:', this.products.length);
      } else {
        this.products = this.productService.getProducts();
      }
    } catch (error: any) {
      console.warn('⚠️ Failed to load products from backend:', error.message);
      this.errorMessage.set('Impossible de charger les produits depuis MySQL. Utilisation des données locales.');
      this.products = this.productService.getProducts();
    } finally {
      this.isLoading.set(false);
    }
  }

  filteredProducts = computed(() => {
    let result = this.products;
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }
    
    if (this.filterCategory) {
      result = result.filter(p => p.categoryId === +this.filterCategory);
    }
    
    if (this.filterStock) {
      if (this.filterStock === 'in') result = result.filter(p => (p.stock || 0) >= 10);
      if (this.filterStock === 'low') result = result.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10);
      if (this.filterStock === 'out') result = result.filter(p => (p.stock || 0) === 0);
    }
    
    return result;
  });

  getCategoryName(categoryId?: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category?.name || 'Non classé';
  }

  getStockClass(stock: number): string {
    if (stock === 0) return 'bg-red-100 text-red-700';
    if (stock < 10) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  }

  getStockDot(stock: number): string {
    if (stock === 0) return 'bg-red-500';
    if (stock < 10) return 'bg-orange-500';
    return 'bg-green-500';
  }

  getInStockCount(): number {
    return this.products.filter(p => (p.stock || 0) >= 10).length;
  }

  getLowStockCount(): number {
    return this.products.filter(p => (p.stock || 0) > 0 && (p.stock || 0) < 10).length;
  }

  getOutOfStockCount(): number {
    return this.products.filter(p => (p.stock || 0) === 0).length;
  }

  openAddModal(): void {
    this.editingProduct.set(null);
    this.formData = {
      name: '',
      price: 0,
      stock: 50,
      categoryId: 1,
      badge: '',
      image: '',
      description: ''
    };
    this.showModal.set(true);
  }

  editProduct(product: Product): void {
    this.editingProduct.set(product);
    this.formData = {
      name: product.name,
      price: product.price,
      stock: product.stock || 0,
      categoryId: product.categoryId || 1,
      badge: product.badge || '',
      image: product.image,
      description: product.description || ''
    };
    this.showModal.set(true);
  }

  duplicateProduct(product: Product): void {
    this.editingProduct.set(null);
    this.formData = {
      name: product.name + ' (copie)',
      price: product.price,
      stock: product.stock || 0,
      categoryId: product.categoryId || 1,
      badge: product.badge || '',
      image: product.image,
      description: product.description || ''
    };
    this.showModal.set(true);
  }

  closeModal(): void {
    this.showModal.set(false);
    this.editingProduct.set(null);
  }

  async saveProduct(): Promise<void> {
    if (!this.formData.name || !this.formData.price || this.formData.price <= 0) {
      this.errorMessage.set('Veuillez remplir tous les champs requis');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    try {
      const productData = {
        name: this.formData.name,
        price: this.formData.price,
        stock: this.formData.stock,
        categoryId: this.formData.categoryId,
        badge: this.formData.badge || null,
        image: this.formData.image || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800&h=800&fit=crop&q=80',
        description: this.formData.description || null,
        rating: 0,
        reviews: 0
      };

      if (this.editingProduct()) {
        const response = await firstValueFrom(
          this.apiService.updateProduct(this.editingProduct()!.id, productData)
        );

        if (response.success) {
          await this.loadProducts();
          this.successMessage.set('Produit mis à jour avec succès dans MySQL');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.closeModal();
        } else {
          this.errorMessage.set(response.message || 'Erreur lors de la mise à jour');
        }
      } else {
        const response = await firstValueFrom(
          this.apiService.createProduct(productData)
        );

        if (response.success) {
          await this.loadProducts();
          this.successMessage.set('Produit créé avec succès dans MySQL');
          setTimeout(() => this.successMessage.set(''), 3000);
          this.closeModal();
        } else {
          this.errorMessage.set(response.message || 'Erreur lors de la création');
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      this.errorMessage.set(error?.error?.message || error?.message || 'Erreur lors de l\'enregistrement');
    } finally {
      this.isLoading.set(false);
    }
  }

  async deleteProduct(product: Product): Promise<void> {
    if (!confirm(`Supprimer "${product.name}" ? Cette action est irréversible.`)) {
      return;
    }

    this.isLoading.set(true);
    try {
      const response = await firstValueFrom(
        this.apiService.deleteProduct(product.id)
      );

      if (response.success) {
        await this.loadProducts();
        this.successMessage.set('Produit supprimé avec succès');
        setTimeout(() => this.successMessage.set(''), 3000);
      } else {
        this.errorMessage.set(response.message || 'Erreur lors de la suppression');
      }
    } catch (error: any) {
      console.error('Error deleting product:', error);
      this.errorMessage.set(error?.error?.message || error?.message || 'Erreur lors de la suppression');
    } finally {
      this.isLoading.set(false);
    }
  }
}

