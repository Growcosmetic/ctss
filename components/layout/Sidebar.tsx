"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Package,
  UserCircle,
  ShoppingCart,
  BarChart3,
  Settings,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CTSSRole } from "@/features/auth/types";
import { useUIStore } from "@/store/useUIStore";

interface MenuItem {
  href: string;
  label: string;
  icon: any;
  roles: CTSSRole[]; // Roles that can access this menu
}

const allMenuItems: MenuItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
  { href: "/booking", label: "Đặt lịch", icon: Calendar, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
  { href: "/crm", label: "CRM", icon: Users, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST"] },
  { href: "/services", label: "Dịch vụ", icon: Scissors, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
  { href: "/inventory", label: "Kho hàng", icon: Package, roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
  { href: "/staff", label: "Nhân viên", icon: UserCircle, roles: ["STYLIST", "ASSISTANT"] },
  { href: "/staff-management", label: "Quản lý nhân viên", icon: UserCircle, roles: ["ADMIN", "MANAGER"] },
  { href: "/pos", label: "POS", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
  { href: "/reports", label: "Báo cáo", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { href: "/mina", label: "Mina AI", icon: Sparkles, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
  { href: "/settings", label: "Cài đặt", icon: Settings, roles: ["ADMIN"] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { user, hasAnyRole } = useAuth();
  const { sidebarOpen } = useUIStore();

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    if (!user) return false;
    return hasAnyRole(item.roles);
  });

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md"
        style={{ backgroundColor: "#A4E3E3" }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X size={24} className="text-gray-800" /> : <Menu size={24} className="text-gray-800" />}
      </button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-sidebar z-40 transform transition-transform duration-300 ease-in-out",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          !sidebarOpen && "lg:-translate-x-full"
        )}
        style={{ backgroundColor: "#A4E3E3", width: "240px" }}
      >
        {/* Logo */}
        <div className="h-header flex items-center justify-center border-b px-4" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          <h1 className="text-xl font-bold text-gray-800">CTSS</h1>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "text-gray-800 font-semibold"
                        : "text-gray-700 hover:text-gray-900"
                    )}
                    style={{
                      backgroundColor: isActive
                        ? "rgba(255,255,255,0.2)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                      } else {
                        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.2)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isActive
                        ? "rgba(255,255,255,0.2)"
                        : "transparent";
                    }}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
}
