"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Filter, X, Star } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { MENU_ITEMS, GROUP_ORDER, GROUP_ICONS, MenuItemData } from "@/lib/menuItems";
import { cn } from "@/lib/utils";

export default function ModulesPage() {
  const router = useRouter();
  const { user, hasAnyRole, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // Filter modules by user roles
  const visibleModules = useMemo(() => {
    if (!user) return [];
    return MENU_ITEMS.filter((item) => hasAnyRole(item.roles));
  }, [user, hasAnyRole]);

  // Get unique groups
  const availableGroups = useMemo(() => {
    const groups = new Set(visibleModules.map((item) => item.group));
    return Array.from(groups).sort((a, b) => {
      const indexA = GROUP_ORDER.indexOf(a);
      const indexB = GROUP_ORDER.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [visibleModules]);

  // Filter modules by search and group
  const filteredModules = useMemo(() => {
    let filtered = visibleModules;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.group.toLowerCase().includes(query) ||
          item.path.toLowerCase().includes(query)
      );
    }

    // Filter by selected group
    if (selectedGroup) {
      filtered = filtered.filter((item) => item.group === selectedGroup);
    }

    return filtered;
  }, [visibleModules, searchQuery, selectedGroup]);

  // Toggle favorite
  const toggleFavorite = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavorites = new Set(favorites);
    if (newFavorites.has(key)) {
      newFavorites.delete(key);
    } else {
      newFavorites.add(key);
    }
    setFavorites(newFavorites);
    // Store in localStorage
    localStorage.setItem("module-favorites", JSON.stringify(Array.from(newFavorites)));
  };

  // Load favorites from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem("module-favorites");
    if (stored) {
      try {
        setFavorites(new Set(JSON.parse(stored)));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tất cả các Module</h1>
          <p className="text-gray-600">
            Tìm kiếm và khám phá tất cả các tính năng của hệ thống CTSS
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm module theo tên, nhóm hoặc đường dẫn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Group Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGroup(null)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                selectedGroup === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Tất cả ({visibleModules.length})
            </button>
            {availableGroups.map((group) => {
              const count = visibleModules.filter((item) => item.group === group).length;
              const GroupIcon = GROUP_ICONS[group];
              return (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group === selectedGroup ? null : group)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
                    selectedGroup === group
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {GroupIcon && <GroupIcon size={16} />}
                  {group} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Hiển thị {filteredModules.length} / {visibleModules.length} modules
        </div>

        {/* Modules Grid */}
        {filteredModules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600 mb-2">Không tìm thấy module nào</p>
            <p className="text-sm text-gray-500">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc nhóm
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredModules.map((module) => {
              const Icon = module.icon;
              const isFavorite = favorites.has(module.key);
              return (
                <Link
                  key={module.key}
                  href={module.path}
                  className="group relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
                >
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => toggleFavorite(module.key, e)}
                    className={cn(
                      "absolute top-4 right-4 p-2 rounded-full transition-colors",
                      isFavorite
                        ? "text-yellow-500 hover:text-yellow-600"
                        : "text-gray-300 hover:text-yellow-400"
                    )}
                    title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                  >
                    <Star size={18} className={isFavorite ? "fill-current" : ""} />
                  </button>

                  {/* Module Icon */}
                  <div className="mb-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <Icon size={24} className="text-blue-600" />
                    </div>
                  </div>

                  {/* Module Info */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {module.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{module.group}</p>
                  <p className="text-xs text-gray-400 font-mono">{module.path}</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

