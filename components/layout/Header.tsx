"use client";

import { Bell, Search, User, LogOut, Menu, X, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CTSSRole } from "@/features/auth/types";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import AlertBadge from "@/components/alerts/AlertBadge";
import { useUIStore } from "@/store/useUIStore";
import { useEffect, useState } from "react";

const roleLabels: Record<CTSSRole, string> = {
  ADMIN: "Quản trị viên",
  MANAGER: "Quản lý",
  RECEPTIONIST: "Lễ tân",
  STYLIST: "Stylist",
  ASSISTANT: "Trợ lý",
};

export default function Header() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [salonName, setSalonName] = useState<string | null>(null);

  useEffect(() => {
    // Fetch current salon info
    fetch("/api/salons")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSalonName(data.data.name);
        }
      })
      .catch(() => {
        // Silently fail if API is not available
      });
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <header
      className="flex items-center justify-between px-6 bg-white"
      style={{
        height: "72px",
        borderBottom: "1px solid #E7E7E7",
      }}
    >
      {/* Toggle Sidebar Button */}
      <button
        onClick={toggleSidebar}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors mr-2"
        title={sidebarOpen ? "Ẩn menu" : "Hiện menu"}
      >
        {sidebarOpen ? <ChevronLeft size={20} className="text-gray-600" /> : <ChevronRight size={20} className="text-gray-600" />}
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            style={{ borderRadius: "8px" }}
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Tenant Indicator */}
        {salonName && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg">
            <Building2 size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              Salon: {salonName}
            </span>
          </div>
        )}

        {/* System Alerts */}
        <AlertBadge className="mr-2" />
        
        {/* Notifications */}
        <NotificationBell />

        {/* User menu */}
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
              <User size={20} />
            </div>
            <div className="hidden md:block text-sm">
              <p className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-gray-500 text-xs">
                {user.email} • {roleLabels[user.role]}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Đăng nhập
          </button>
        )}
      </div>
    </header>
  );
}
