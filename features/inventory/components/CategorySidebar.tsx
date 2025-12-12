"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { ProductStock } from "../types";

interface CategorySidebarProps {
  stocks: ProductStock[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
}

export default function CategorySidebar({
  stocks,
  selectedCategory,
  onCategorySelect,
}: CategorySidebarProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["all"]));

  // Calculate group counts - Group by supplier name or brand
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = { all: stocks.length };
    
    stocks.forEach((stock) => {
      // Ưu tiên supplier name, sau đó brand, cuối cùng category
      const groupName = stock.product?.supplier?.name || stock.product?.brand || stock.product?.category || "Khác";
      counts[groupName] = (counts[groupName] || 0) + 1;
    });

    return counts;
  }, [stocks]);

  // Get unique groups - Supplier/Brand/Category
  const categories = React.useMemo(() => {
    const groups = new Set<string>();
    stocks.forEach((stock) => {
      const groupName = stock.product?.supplier?.name || stock.product?.brand || stock.product?.category;
      if (groupName) {
        groups.add(groupName);
      }
    });
    return Array.from(groups).sort();
  }, [stocks]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      // TODO: Implement create group functionality
      alert(`Tạo nhóm "${newGroupName}" - Tính năng đang phát triển`);
      setNewGroupName("");
    }
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900">Phân nhóm sản phẩm</h3>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* All Products */}
          <button
            onClick={() => onCategorySelect("all")}
            className={`
              w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
              ${selectedCategory === "all"
                ? "bg-blue-50 text-blue-700 font-medium"
                : "text-gray-700 hover:bg-gray-50"
              }
            `}
          >
            <span>Tất cả</span>
            <span className="text-xs text-gray-500">({categoryCounts.all || 0})</span>
          </button>

          {/* Categories */}
          {categories.map((category) => {
            const isExpanded = expandedCategories.has(category);
            const count = categoryCounts[category] || 0;

            return (
              <div key={category} className="mt-1">
                <button
                  onClick={() => {
                    toggleCategory(category);
                    onCategorySelect(category);
                  }}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors
                    ${selectedCategory === category
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="uppercase">{category}</span>
                  </div>
                  <span className="text-xs text-gray-500">({count})</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Group Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-2">
          <input
            type="text"
            placeholder="nhập tên nhóm..."
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleCreateGroup();
              }
            }}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleCreateGroup}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Tạo nhóm
          </button>
        </div>
      </div>
    </div>
  );
}
