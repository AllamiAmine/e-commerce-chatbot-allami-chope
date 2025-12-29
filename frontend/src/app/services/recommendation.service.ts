import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProductRecommendation {
  product_id: string;
  score: number;
  strategy: string;
}

export interface UserRecommendationsResponse {
  user_id: string;
  recommendations: ProductRecommendation[];
  total: number;
  strategy_used: string;
}

export interface SimilarProductsResponse {
  product_id: string;
  similar_products: ProductRecommendation[];
  total: number;
}

export interface PopularProductsResponse {
  products: ProductRecommendation[];
  total: number;
}

export interface RecommendationHealth {
  status: string;
  model_loaded: boolean;
  version: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {
  private apiUrl = environment.recommendationApiUrl || 'http://localhost:8085';

  constructor(private http: HttpClient) {}

  /**
   * Get personalized recommendations for a user
   * @param userId User ID
   * @param limit Number of recommendations (default: 10)
   */
  getRecommendationsForUser(userId: number | string, limit: number = 10): Observable<UserRecommendationsResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<UserRecommendationsResponse>(
      `${this.apiUrl}/api/recommendations/user/${userId}`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Failed to get user recommendations:', error);
        return of({
          user_id: userId.toString(),
          recommendations: [],
          total: 0,
          strategy_used: 'error'
        });
      })
    );
  }

  /**
   * Get products similar to a given product
   * @param productId Product ID
   * @param limit Number of similar products (default: 5)
   */
  getSimilarProducts(productId: number | string, limit: number = 5): Observable<SimilarProductsResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<SimilarProductsResponse>(
      `${this.apiUrl}/api/recommendations/product/${productId}/similar`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Failed to get similar products:', error);
        return of({
          product_id: productId.toString(),
          similar_products: [],
          total: 0
        });
      })
    );
  }

  /**
   * Get popular products (for homepage or cold start)
   * @param limit Number of products (default: 20)
   */
  getPopularProducts(limit: number = 20): Observable<PopularProductsResponse> {
    const params = new HttpParams().set('limit', limit.toString());
    
    return this.http.get<PopularProductsResponse>(
      `${this.apiUrl}/api/recommendations/popular`,
      { params }
    ).pipe(
      catchError(error => {
        console.error('Failed to get popular products:', error);
        return of({
          products: [],
          total: 0
        });
      })
    );
  }

  /**
   * Get recommendation product IDs for easier integration
   */
  getRecommendedProductIds(userId: number | string, limit: number = 10): Observable<string[]> {
    return this.getRecommendationsForUser(userId, limit).pipe(
      map(response => response.recommendations.map(r => r.product_id))
    );
  }

  /**
   * Get similar product IDs
   */
  getSimilarProductIds(productId: number | string, limit: number = 5): Observable<string[]> {
    return this.getSimilarProducts(productId, limit).pipe(
      map(response => response.similar_products.map(r => r.product_id))
    );
  }

  /**
   * Check if recommendation service is healthy
   */
  checkHealth(): Observable<RecommendationHealth> {
    return this.http.get<RecommendationHealth>(`${this.apiUrl}/health`).pipe(
      catchError(() => of({
        status: 'unavailable',
        model_loaded: false,
        version: 'unknown'
      }))
    );
  }
}


