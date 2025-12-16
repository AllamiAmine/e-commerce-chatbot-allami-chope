import { Injectable, signal, computed } from '@angular/core';
import { Product, CartItem } from '../models/product.model';

export interface CartItemWithProduct {
  product: Product;
  quantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSignal = signal<CartItemWithProduct[]>([]);
  
  readonly cartItems = this.cartItemsSignal.asReadonly();
  readonly cartCount = computed(() => 
    this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0)
  );
  readonly subtotal = computed(() =>
    this.cartItemsSignal().reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  );

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
      const existing = items.find(x => x.product.id === product.id);
      if (existing) {
        return items.map(x => 
          x.product.id === product.id ? { ...x, quantity: x.quantity + 1 } : x
        );
      }
      return [...items, { product, quantity: 1 }];
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
    this.cartItemsSignal.update(items => items.filter(x => x.product.id !== id));
    this.saveToStorage();
  }

  updateQuantity(id: number, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(id);
      return;
    }
    this.cartItemsSignal.update(items =>
      items.map(x => x.product.id === id ? { ...x, quantity } : x)
    );
    this.saveToStorage();
  }

  clearCart(): void {
    this.cartItemsSignal.set([]);
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this.cartItemsSignal()));
    } catch (e) {
      console.warn('Could not save cart to storage');
    }
  }

  loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('cart');
      if (stored) {
        this.cartItemsSignal.set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Could not load cart from storage');
    }
  }

  constructor() {
    this.loadFromStorage();
  }
}
