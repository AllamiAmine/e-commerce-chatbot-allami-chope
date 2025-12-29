export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string | null;
  categoryId?: number;
  description?: string;
  stock?: number;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  keywords?: string[];
}

export interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  products?: Product[];
  category?: Category;
  intent?: ChatIntent;
}

export type ChatIntent = 
  | 'greeting'
  | 'product_search'
  | 'category_browse'
  | 'recommendation'
  | 'order_status'
  | 'delivery_tracking'
  | 'price_inquiry'
  | 'help'
  | 'payment'
  | 'return'
  | 'thanks'
  | 'add_to_cart'
  | 'unknown';

export interface NLPResult {
  intent: ChatIntent;
  entities: {
    category?: string;
    productName?: string;
    priceRange?: { min?: number; max?: number };
    keywords: string[];
  };
  confidence: number;
}
