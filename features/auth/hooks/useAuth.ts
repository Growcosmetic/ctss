"use client";

import { useState, useEffect } from "react";
import { login, logout, getCurrentUser } from "../services/authApi";
import { LoginRequest, User, CTSSRole } from "../types";

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (requiredRole: CTSSRole) => boolean;
  hasAnyRole: (roleList: CTSSRole[]) => boolean;
  hasPermission: (module: string, action: string) => boolean;
}

// Permission matrix
const PERMISSIONS: Record<CTSSRole, Record<string, string[]>> = {
  ADMIN: {
    booking: ["VIEW", "CREATE", "UPDATE", "DELETE"],
    pos: ["VIEW", "CREATE", "UPDATE", "DELETE"],
    crm: ["VIEW", "CREATE", "UPDATE", "DELETE"],
    reports: ["VIEW", "CREATE", "UPDATE", "DELETE"],
    mina: ["VIEW", "CREATE", "UPDATE", "DELETE"],
    settings: ["VIEW", "CREATE", "UPDATE", "DELETE"],
  },
  MANAGER: {
    booking: ["VIEW", "CREATE", "UPDATE"],
    pos: ["VIEW", "CREATE", "UPDATE"],
    crm: ["VIEW", "CREATE", "UPDATE"],
    reports: ["VIEW"],
    mina: ["VIEW", "CREATE", "UPDATE"],
    settings: [],
  },
  RECEPTIONIST: {
    booking: ["VIEW", "CREATE", "UPDATE", "DELETE"],
    pos: ["VIEW", "CREATE", "UPDATE"],
    crm: ["VIEW", "CREATE", "UPDATE"],
    reports: [],
    mina: ["VIEW", "CREATE", "UPDATE"],
    settings: [],
  },
  STYLIST: {
    booking: ["VIEW"], // Only own bookings
    pos: [],
    crm: ["VIEW"], // Summary only
    reports: [],
    mina: ["VIEW"], // Suggestions + summary only
    settings: [],
  },
  ASSISTANT: {
    booking: ["VIEW"], // Only assigned
    pos: [],
    crm: [],
    reports: [],
    mina: ["VIEW"], // Suggestions only
    settings: [],
  },
};

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user on mount
  useEffect(() => {
    refreshUser();
  }, []);

  const handleLogin = async (request: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(request);
      setUser(response.user);
      // Token is stored in cookie by server
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      await logout();
      setUser(null);
    } catch (err: any) {
      setError(err.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (requiredRole: CTSSRole): boolean => {
    return user?.role === requiredRole;
  };

  const hasAnyRole = (roleList: CTSSRole[]): boolean => {
    if (!user) return false;
    return roleList.includes(user.role);
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!user) return false;
    const rolePermissions = PERMISSIONS[user.role];
    if (!rolePermissions) return false;
    const modulePermissions = rolePermissions[module];
    if (!modulePermissions) return false;
    return modulePermissions.includes(action);
  };

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    authenticated: !!user, // Alias for compatibility
    login: handleLogin,
    logout: handleLogout,
    refreshUser,
    hasRole,
    hasAnyRole,
    hasPermission,
  };
}

