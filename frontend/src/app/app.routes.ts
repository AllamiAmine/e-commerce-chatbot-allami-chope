import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public routes
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'categories',
    loadComponent: () => import('./pages/categories/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./pages/product-detail/product-detail.component').then(m => m.ProductDetailComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  
  // Shopping routes
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(m => m.CartComponent)
  },
  {
    path: 'checkout',
    loadComponent: () => import('./pages/checkout/checkout.component').then(m => m.CheckoutComponent)
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./pages/wishlist/wishlist.component').then(m => m.WishlistComponent)
  },
  
  // User account routes
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent)
  },
  
  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin.component').then(m => m.AdminComponent)
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./pages/admin/users/users.component').then(m => m.AdminUsersComponent)
  },
  {
    path: 'admin/products',
    loadComponent: () => import('./pages/admin/products/products.component').then(m => m.AdminProductsComponent)
  },
  {
    path: 'admin/orders',
    loadComponent: () => import('./pages/admin/orders/orders.component').then(m => m.AdminOrdersComponent)
  },
  {
    path: 'admin/analytics',
    loadComponent: () => import('./pages/admin/analytics/analytics.component').then(m => m.AdminAnalyticsComponent)
  },
  {
    path: 'admin/settings',
    loadComponent: () => import('./pages/admin/settings/settings.component').then(m => m.AdminSettingsComponent)
  },
  {
    path: 'admin/chatbot',
    loadComponent: () => import('./pages/admin/chatbot/chatbot.component').then(m => m.AdminChatbotComponent)
  },
  
  // 404 - Not Found
  {
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent)
  },
  {
    path: '**',
    redirectTo: '404'
  }
];
