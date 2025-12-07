"use client";

import React from "react";
import { useAuth } from "../hooks/useAuth";
import { CTSSRole } from "../types";
import { Loader2, Lock } from "lucide-react";

interface RoleGuardProps {
  children: React.ReactNode;
  roles: CTSSRole[];
  fallback?: React.ReactNode;
  requireAll?: boolean; // If true, user must have ALL roles (for future multi-role support)
}

export default function RoleGuard({
  children,
  roles,
  fallback,
  requireAll = false,
}: RoleGuardProps) {
  const { user, loading, hasAnyRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Đang kiểm tra quyền truy cập...</span>
      </div>
    );
  }

  if (!user) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
          <Lock className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Yêu cầu đăng nhập</h3>
          <p className="text-sm text-gray-600">Vui lòng đăng nhập để truy cập tính năng này</p>
        </div>
      )
    );
  }

  if (!hasAnyRole(roles)) {
    return (
      fallback || (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <Lock className="w-12 h-12 text-red-400 mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Không có quyền truy cập</h3>
          <p className="text-sm text-red-700">
            Bạn cần quyền {roles.join(" hoặc ")} để truy cập tính năng này
          </p>
          <p className="text-xs text-red-600 mt-2">Vai trò hiện tại: {user.role}</p>
        </div>
      )
    );
  }

  return <>{children}</>;
}

