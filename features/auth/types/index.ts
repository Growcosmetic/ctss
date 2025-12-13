// ============================================
// Auth Types
// ============================================

export enum CTSSRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  RECEPTIONIST = "RECEPTIONIST",
  STYLIST = "STYLIST",
  ASSISTANT = "ASSISTANT",
}

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  name?: string; // Full name (if firstName/lastName not available)
  phone?: string | null;
  avatar?: string | null;
  role: CTSSRole;
  salonId?: string; // Multi-tenant: Salon ID
  isActive?: boolean;
  lastLoginAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email?: string;
  phone?: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

