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
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  Phone,
  Award,
  Heart,
  Building2,
  Target,
  TrendingUp,
  DollarSign,
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
  roles: CTSSRole[];
}

interface MenuGroup {
  label: string;
  icon: any;
  roles: CTSSRole[];
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
    items: [
      { href: "/dashboard", label: "Main Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
      { href: "/control-tower", label: "CEO Control Tower", icon: LayoutDashboard, roles: ["ADMIN"] },
    ],
  },
  {
    label: "Đặt lịch",
    icon: Calendar,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
    items: [
      { href: "/booking", label: "Booking Calendar", icon: Calendar, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
    ],
  },
  {
    label: "Khách hàng",
    icon: Users,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST"],
    items: [
      { href: "/crm", label: "CRM Dashboard", icon: Users, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST"] },
      { href: "/membership", label: "Membership", icon: Award, roles: ["ADMIN", "MANAGER"] },
      { href: "/personalization", label: "Personalization", icon: Target, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    label: "Dịch vụ",
    icon: Scissors,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
    items: [
      { href: "/services", label: "Services", icon: Scissors, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
      { href: "/pricing", label: "Pricing", icon: DollarSign, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    label: "Kho hàng",
    icon: Package,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
    items: [
      { href: "/inventory", label: "Inventory", icon: Package, roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
    ],
  },
  {
    label: "Nhân viên",
    icon: UserCircle,
    roles: ["ADMIN", "MANAGER", "STYLIST", "ASSISTANT"],
    items: [
      { href: "/staff", label: "Staff", icon: UserCircle, roles: ["STYLIST", "ASSISTANT"] },
      { href: "/staff-management", label: "Staff Management", icon: UserCircle, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    label: "Bán hàng",
    icon: ShoppingCart,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST"],
    items: [
  { href: "/pos", label: "POS", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "RECEPTIONIST"] },
      { href: "/sales", label: "Sales Dashboard", icon: TrendingUp, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    label: "Báo cáo",
    icon: BarChart3,
    roles: ["ADMIN", "MANAGER"],
    items: [
      { href: "/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
      { href: "/reports/financial", label: "Financial", icon: DollarSign, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    label: "Marketing",
    icon: Sparkles,
    roles: ["ADMIN", "MANAGER"],
    items: [
      { href: "/marketing/dashboard", label: "Marketing Dashboard", icon: Sparkles, roles: ["ADMIN", "MANAGER"] },
    ],
  },
  {
    label: "Analytics",
    icon: BarChart3,
    roles: ["ADMIN", "MANAGER"],
    items: [
      { href: "/quality", label: "Quality", icon: CheckCircle, roles: ["ADMIN", "MANAGER"] },
      { href: "/voice", label: "Voice Analytics", icon: Phone, roles: ["ADMIN", "MANAGER"] },
      { href: "/hair-health", label: "Hair Health", icon: Heart, roles: ["ADMIN", "MANAGER", "STYLIST"] },
    ],
  },
  {
    label: "Hệ thống",
    icon: Settings,
    roles: ["ADMIN", "MANAGER"],
    items: [
      { href: "/operations", label: "Operations", icon: Settings, roles: ["ADMIN", "MANAGER"] },
      { href: "/training/dashboard", label: "Training", icon: Settings, roles: ["ADMIN", "MANAGER"] },
      { href: "/sop", label: "SOP", icon: Settings, roles: ["ADMIN", "MANAGER"] },
      { href: "/workflow-console", label: "Workflow", icon: Settings, roles: ["ADMIN", "MANAGER"] },
      { href: "/partner/hq", label: "Partner HQ", icon: Building2, roles: ["ADMIN"] },
      { href: "/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
    ],
  },
  {
    label: "AI",
    icon: Sparkles,
    roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"],
    items: [
  { href: "/mina", label: "Mina AI", icon: Sparkles, roles: ["ADMIN", "MANAGER", "RECEPTIONIST", "STYLIST", "ASSISTANT"] },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Dashboard"]));
  const { user, hasAnyRole } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  const visibleGroups = menuGroups.filter((group) => {
    if (!user) return false;
    return hasAnyRole(group.roles);
  });

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md"
        style={{ backgroundColor: "#A4E3E3" }}
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label={isMobileOpen ? "Đóng menu" : "Mở menu"}
      >
        {isMobileOpen ? <ChevronLeft size={24} className="text-gray-800" /> : <ChevronRight size={24} className="text-gray-800" />}
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
        <div className="h-header flex items-center justify-between border-b px-4" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
          <h1 className="text-xl font-bold text-gray-800">CTSS</h1>
          <button
            onClick={() => {
              toggleSidebar();
              setIsMobileOpen(false);
            }}
            className="lg:block hidden p-2 hover:bg-white/20 rounded-lg transition-colors"
            aria-label={sidebarOpen ? "Đóng menu" : "Mở menu"}
            title={sidebarOpen ? "Đóng menu" : "Mở menu"}
          >
            {sidebarOpen ? <ChevronLeft size={20} className="text-gray-800" /> : <ChevronRight size={20} className="text-gray-800" />}
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
          <ul className="space-y-1 px-2">
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon;
              const isExpanded = expandedGroups.has(group.label);
              const visibleItems = group.items.filter((item) => {
                if (!user) return false;
                return hasAnyRole(item.roles);
              });

              if (visibleItems.length === 0) return null;

              // Nếu chỉ có 1 item, không cần group
              if (visibleItems.length === 1) {
                const item = visibleItems[0];
                const ItemIcon = item.icon;
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
                      <ItemIcon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                  </li>
                );
              }

              // Nếu có nhiều items, hiển thị group với submenu
              return (
                <li key={group.label}>
                  <button
                    onClick={() => toggleGroup(group.label)}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors text-gray-700 hover:text-gray-900 hover:bg-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon size={20} />
                      <span className="font-medium">{group.label}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={cn(
                        "transition-transform",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {visibleItems.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname.startsWith(item.href);

                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                                isActive
                                  ? "text-gray-800 font-semibold"
                                  : "text-gray-600 hover:text-gray-900"
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
                              <ItemIcon size={16} />
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
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
