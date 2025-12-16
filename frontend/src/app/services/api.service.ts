import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message;
    } else {
      // Server-side error
      if (error.error?.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est en cours d\'exécution.';
      } else if (error.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (error.status === 403) {
        errorMessage = 'Accès non autorisé';
      } else if (error.status === 404) {
        errorMessage = 'Ressource non trouvée';
      }
    }
    
    console.error('API Error:', error);
    return throwError(() => new Error(errorMessage));
  }

  // ==================== AUTH ====================
  
  login(email: string, password: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/auth/login`,
      { email, password },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  register(data: { name: string; email: string; password: string; phone?: string; role: string }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/auth/register`,
      data,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  validateToken(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/auth/validate`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== USERS ====================

  getCurrentUser(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/users/me`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  updateCurrentUser(data: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/users/me`,
      data,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  // Admin endpoints
  getAllUsers(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/users/admin/all`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== PRODUCTS ====================

  getProducts(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/products`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getProductById(id: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/products/${id}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getCategories(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/products/categories`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getProductsByCategory(categoryId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/products/category/${categoryId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  searchProducts(query: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/products/search?q=${encodeURIComponent(query)}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getTopRatedProducts(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/products/top-rated`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getPromotionalProducts(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/products/promotions`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== ORDERS ====================

  getOrders(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/orders`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getOrdersByUser(userId: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/orders/user/${userId}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  getOrderByNumber(orderNumber: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/orders/number/${orderNumber}`,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  createOrder(orderData: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/orders`,
      orderData,
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  updateOrderStatus(orderId: number, status: string): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/orders/${orderId}/status`,
      { status },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  cancelOrder(orderId: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(
      `${this.apiUrl}/orders/${orderId}/cancel`,
      {},
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }

  // ==================== CHATBOT ====================

  sendChatMessage(message: string, userId?: number): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/chatbot/message`,
      { message, userId },
      { headers: this.getHeaders() }
    ).pipe(catchError(this.handleError.bind(this)));
  }
}

