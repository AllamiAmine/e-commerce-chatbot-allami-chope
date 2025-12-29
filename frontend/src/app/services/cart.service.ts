import { Injectable, signal, computed, inject, effect } from '@angular/core';
import { Product, CartItem } from '../models/product.model';
import { AuthService } from './auth.service';

export interface CartItemWithProduct {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private authService = inject(AuthService);
  private cartItemsSignal = signal<CartItemWithProduct[]>([]);
  
  readonly cartItems = this.cartItemsSignal.asReadonly();
  readonly cartCount = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.cartItemsSignal().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

  // Get storage key based on user ID
  private getStorageKey(): string {
    const user = this.authService.user();
    if (user && user.id) {
      return `cart_${user.id}`;
    }
    return 'cart_guest'; // For non-logged-in users
  }

  // Legacy getter for compatibility
  readonly items = computed(() => 
    this.cartItemsSignal().map(item => ({
      id: item.product.id,
      name: item.product.name,
      price: item.product.price,
      image: item.product.image,
      quantity: item.quantity
    }))
  );

  addToCart(product: Product): void {
    this.cartItemsSignal.update(items => {
      // Find existing item by product ID
      const existingIndex = items.findIndex(x => x.product.id === product.id);
      
      if (existingIndex !== -1) {
        // Product already exists, increment quantity
        const updatedItems = [...items];
        updatedItems[existingIndex] = {
          ...updatedItems[existingIndex],
          quantity: updatedItems[existingIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // New product, add to cart
        return [...items, { product, quantity: 1 }];
      }
    });
    this.saveToStorage();
  }

  // Legacy method for compatibility
  addToCartLegacy(item: CartItem): void {
    this.cartItemsSignal.update(items => {
      const existing = items.find(x => x.product.id === item.id);
      if (existing) {
        return items.map(x => 
          x.product.id === item.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      const product: Product = {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        rating: 0,
        reviews: 0,
        categoryId: 0
      };
      return [...items, { product, quantity: 1 }];
    });
    this.saveToStorage();
  }

  removeFromCart(id: number): void {
    this.cartItemsSignal.update(items => {
      const filtered = items.filter(x => x.product && x.product.id !== id);
      return filtered;
    });
    this.saveToStorage();
  }

  updateQuantity(id: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(id);
      return;
    }
    this.cartItemsSignal.update(items => {
      const itemIndex = items.findIndex(x => x.product.id === id);
      if (itemIndex === -1) {
        // Item not found, return unchanged
        return items;
      }
      const updatedItems = [...items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        quantity: Math.max(1, Math.floor(quantity)) // Ensure quantity is at least 1 and is an integer
      };
      return updatedItems;
    });
    this.saveToStorage();
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.saveToStorage();
  }

  private saveTimeout: any = null;

  private saveToStorage(): void {
    // Debounce saves to avoid too frequent localStorage writes
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    
    this.saveTimeout = setTimeout(() => {
      try {
        // Clean up any duplicates before saving
        const items = this.cartItemsSignal();
        const cleanedItems: CartItemWithProduct[] = [];
        const seenIds = new Set<number>();
        
        items.forEach(item => {
          if (item && item.product && item.product.id) {
            if (!seenIds.has(item.product.id)) {
              seenIds.add(item.product.id);
              cleanedItems.push(item);
            } else {
              // Merge duplicate if found
              const existingIndex = cleanedItems.findIndex(x => x.product.id === item.product.id);
              if (existingIndex !== -1) {
                cleanedItems[existingIndex].quantity += item.quantity;
              }
            }
          }
        });
        
        // Update signal if duplicates were found and removed
        if (cleanedItems.length !== items.length) {
          this.cartItemsSignal.set(cleanedItems);
        }
        
        const storageKey = this.getStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(this.cartItemsSignal()));
      } catch (e) {
        console.warn('Could not save cart to storage:', e);
      }
    }, 300); // Debounce 300ms
  }

  loadFromStorage(): void {
    try {
      const storageKey = this.getStorageKey();
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure we have valid cart items and merge duplicates
        if (Array.isArray(parsed)) {
          const mergedItems: CartItemWithProduct[] = [];
          parsed.forEach((item: any) => {
            if (item && item.product && item.product.id) {
              const existingIndex = mergedItems.findIndex(x => x.product.id === item.product.id);
              if (existingIndex !== -1) {
                // Merge quantities if duplicate found
                mergedItems[existingIndex].quantity += (item.quantity || 1);
              } else {
                // Add new item
                mergedItems.push({
                  product: item.product,
                  quantity: item.quantity || 1
                });
              }
            }
          });
          this.cartItemsSignal.set(mergedItems);
        }
      } else {
        // No cart found for this user, start with empty cart
        this.cartItemsSignal.set([]);
      }
    } catch (e) {
      console.warn('Could not load cart from storage:', e);
      this.cartItemsSignal.set([]);
    }
  }

  // Switch cart when user changes
  private switchUserCart(): void {
    this.loadFromStorage();
  }

  constructor() {
    // Load cart on initialization
    this.loadFromStorage();
    
    // Watch for user changes and reload cart
    effect(() => {
      const user = this.authService.user();
      this.switchUserCart();
    });
  }
}
