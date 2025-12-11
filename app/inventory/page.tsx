"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import MainLayout from "@/components/layout/MainLayout";
import InventoryDashboard from "@/features/inventory/components/InventoryDashboard";
import { Loader2 } from "lucide-react";

export default function InventoryPage() {
  const { authenticated, loading: authLoading, hasAnyRole } = useAuth();
  const router = useRouter();

  if (authLoading) {
    return (
      <MainLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
      </MainLayout>
    );
  }

  if (!authenticated) {
    router.push("/login");
    return null;
  }

  if (!hasAnyRole(["ADMIN", "MANAGER", "RECEPTIONIST"])) {
    return (
      <MainLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Bạn không có quyền truy cập trang này</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Về Dashboard
          </button>
        </div>
      </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <InventoryDashboard />
    </MainLayout>
  );
}
