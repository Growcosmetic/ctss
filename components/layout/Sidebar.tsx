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
  ChevronDown,
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
import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { CTSSRole } from "@/features/auth/types";
import { useUIStore } from "@/store/useUIStore";
import { MENU_ITEMS, GROUP_ORDER, GROUP_ICONS, MenuItemData } from "@/lib/menuItems";

export default function Sidebar() {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Dashboard"]));
  const { user, hasAnyRole } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  // Group menu items by group
  const groupedItems = MENU_ITEMS.reduce((acc, item) => {
    if (!user || !hasAnyRole(item.roles)) return acc;
    
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, MenuItemData[]>);

  const toggleGroup = (groupLabel: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupLabel)) {
      newExpanded.delete(groupLabel);
    } else {
      newExpanded.add(groupLabel);
    }
    setExpandedGroups(newExpanded);
  };

  // Sort groups by GROUP_ORDER (business logic order, not alphabetical)
  const visibleGroups = Object.keys(groupedItems).sort((a, b) => {
    const indexA = GROUP_ORDER.indexOf(a);
    const indexB = GROUP_ORDER.indexOf(b);
    
    // If both groups are in ORDER, sort by order
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    // If only A is in ORDER, A comes first
    if (indexA !== -1) return -1;
    // If only B is in ORDER, B comes first
    if (indexB !== -1) return 1;
    // If neither is in ORDER, sort alphabetically
    return a.localeCompare(b);
  });

  // Auto-collapse groups after navigation (optional)
  useEffect(() => {
    // Reset expandedGroups to default (only Dashboard) after pathname changes
    // This provides cleaner UX - sidebar collapses after user navigates
    setExpandedGroups(new Set(["Dashboard"]));
  }, [pathname]);

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
          "fixed left-0 top-0 h-full w-sidebar z-40 transform transition-transform duration-300 ease-in-out flex flex-col",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          !sidebarOpen && "lg:-translate-x-full"
        )}
        style={{ backgroundColor: "#A4E3E3", width: "240px" }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="h-header flex items-center justify-between border-b px-4 flex-shrink-0" style={{ borderColor: "rgba(0,0,0,0.1)" }}>
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

        {/* Menu Container with fixed height and scroll */}
        <nav 
          className="overflow-y-auto py-4 scrollbar-thin flex-shrink"
          style={{ 
            height: "calc(100vh - 72px)",
            minHeight: 0
          }}
        >
          <ul className="space-y-1 px-2">
            {visibleGroups.map((groupLabel) => {
              const groupItems = groupedItems[groupLabel];
              if (!groupItems || groupItems.length === 0) return null;

              const GroupIcon = GROUP_ICONS[groupLabel] || Settings;
              const isExpanded = expandedGroups.has(groupLabel);

              // Single item - render as direct link with group icon and label (no accordion, no chevron)
              if (groupItems.length === 1) {
                const item = groupItems[0];
                const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

                return (
                  <li key={item.key}>
                    <Link
                      href={item.path}
                      onClick={() => setIsMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                        isActive
                          ? "text-gray-800 font-semibold bg-white/20"
                          : "text-gray-700 hover:text-gray-900 hover:bg-white/10"
                      )}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {/* Use GroupIcon and groupLabel for single-item groups */}
                      <GroupIcon size={20} className={cn("transition-colors", isActive && "text-gray-900")} aria-hidden="true" />
                      <span className="font-medium">{groupLabel}</span>
                      {/* No chevron for single-item groups */}
                    </Link>
                  </li>
                );
              }

              // Multiple items - render as accordion group
              const hasActiveItem = groupItems.some(
                (item) => pathname === item.path || pathname.startsWith(item.path + "/")
              );

              return (
                <li key={groupLabel} className="mb-1">
                  <button
                    onClick={() => toggleGroup(groupLabel)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200",
                      "text-gray-700 hover:text-gray-900 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                      hasActiveItem && "bg-white/5"
                    )}
                    aria-expanded={isExpanded}
                    aria-controls={`menu-group-${groupLabel}`}
                  >
                    <div className="flex items-center gap-3">
                      <GroupIcon size={20} className={cn(hasActiveItem && "text-gray-900")} />
                      <span className="font-medium">{groupLabel}</span>
                    </div>
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform duration-200 flex-shrink-0",
                        isExpanded ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </button>
                  
                  {/* Collapsible content */}
                  <div
                    id={`menu-group-${groupLabel}`}
                    className={cn(
                      "overflow-hidden transition-all duration-200 ease-in-out",
                      isExpanded ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                    )}
                    aria-hidden={!isExpanded}
                    hidden={!isExpanded}
                  >
                    <ul className="ml-4 mt-1 space-y-1 pb-1">
                      {groupItems.map((item) => {
                        const ItemIcon = item.icon;
                        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

                        return (
                          <li key={item.key}>
                            <Link
                              href={item.path}
                              onClick={() => setIsMobileOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
                                isActive
                                  ? "text-gray-800 font-semibold bg-white/20"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-white/10"
                              )}
                              aria-current={isActive ? "page" : undefined}
                            >
                              <ItemIcon 
                                size={16} 
                                className={cn("transition-colors", isActive && "text-gray-900")} 
                                aria-hidden="true"
                              />
                              <span>{item.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
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
