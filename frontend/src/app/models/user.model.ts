// User roles enumeration
export type UserRole = 'admin' | 'client' | 'seller';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  isLoggedIn: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
}

// Role permissions and capabilities
export interface RolePermissions {
  canViewDashboard: boolean;
  canManageProducts: boolean;
  canManageOrders: boolean;
  canManageUsers: boolean;
  canViewAnalytics: boolean;
  canAccessChat: boolean;
  canPurchase: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewDashboard: true,
    canManageProducts: true,
    canManageOrders: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canAccessChat: true,
    canPurchase: true,
  },
  seller: {
    canViewDashboard: true,
    canManageProducts: true,
    canManageOrders: true,
    canManageUsers: false,
    canViewAnalytics: true,
    canAccessChat: true,
    canPurchase: false,
  },
  client: {
    canViewDashboard: false,
    canManageProducts: false,
    canManageOrders: false,
    canManageUsers: false,
    canViewAnalytics: false,
    canAccessChat: true,
    canPurchase: true,
  },
};

// Role display info
export const ROLE_INFO: Record<UserRole, { label: string; icon: string; color: string; description: string }> = {
  admin: {
    label: 'Administrateur',
    icon: '👑',
    color: 'from-purple-500 to-purple-600',
    description: 'Accès complet à toutes les fonctionnalités',
  },
  seller: {
    label: 'Vendeur',
    icon: '🏪',
    color: 'from-blue-500 to-blue-600',
    description: 'Gérer les produits et les commandes',
  },
  client: {
    label: 'Client',
    icon: '🛒',
    color: 'from-green-500 to-green-600',
    description: 'Acheter des produits et suivre les commandes',
  },
};

