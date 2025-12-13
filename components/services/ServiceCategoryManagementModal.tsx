"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { X, Plus, Edit, Trash2, FolderTree, Search } from "lucide-react";

interface ServiceCategory {
  id: string;
  name: string;
  serviceCount: number;
}

interface ServiceCategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: any[];
  onUpdate?: () => void;
}

export default function ServiceCategoryManagementModal({
  isOpen,
  onClose,
  services,
  onUpdate,
}: ServiceCategoryManagementModalProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [loading, setLoading] = useState(false);

  // Load categories from services
  useEffect(() => {
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen, services]);

  const loadCategories = () => {
    // Extract unique categories from services
    const categoryMap = new Map<string, number>();
    services.forEach((service) => {
      const catName = typeof service.category === 'string' 
        ? service.category 
        : service.category?.name || 'Khác';
      categoryMap.set(catName, (categoryMap.get(catName) || 0) + 1);
    });

    const extractedCategories: ServiceCategory[] = Array.from(categoryMap.entries())
      .sort((a, b) => b[1] - a[1]) // Sort by count descending
      .map(([name, count], index) => ({
        id: `cat-${name}-${index}`,
        name,
        serviceCount: count,
      }));

    setCategories(extractedCategories);
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      alert("Vui lòng nhập tên nhóm dịch vụ");
      return;
    }

    setLoading(true);
    try {
      // Create category by creating a placeholder service (or update existing services)
      // For now, we'll just add it to the list
      const newCategory: ServiceCategory = {
        id: `cat-${newCategoryName}-${Date.now()}`,
        name: newCategoryName.trim(),
        serviceCount: 0,
      };
      
      setCategories([...categories, newCategory].sort((a, b) => b.serviceCount - a.serviceCount));
      setNewCategoryName("");
      setIsCreating(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error creating category:", error);
      alert("Có lỗi xảy ra khi tạo nhóm dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (oldName: string, newName: string) => {
    if (!newName.trim() || newName.trim() === oldName) {
      setEditingCategory(null);
      return;
    }

    setLoading(true);
    try {
      // Update category by updating all services with this category
      const response = await fetch("/api/services/bulk-update-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldCategory: oldName,
          newCategory: newName.trim(),
        }),
      });

      if (response.ok) {
        loadCategories();
        setEditingCategory(null);
        onUpdate?.();
      } else {
        throw new Error("Failed to update category");
      }
    } catch (error) {
      console.error("Error updating category:", error);
      alert("Có lỗi xảy ra khi cập nhật nhóm dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (categoryName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa nhóm "${categoryName}"?\n\nTất cả dịch vụ trong nhóm này sẽ được chuyển sang nhóm "Khác".`)) {
      return;
    }

    setLoading(true);
    try {
      // Move all services to "Khác" category
      const response = await fetch("/api/services/bulk-update-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldCategory: categoryName,
          newCategory: "Khác",
        }),
      });

      if (response.ok) {
        loadCategories();
        onUpdate?.();
      } else {
        throw new Error("Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Có lỗi xảy ra khi xóa nhóm dịch vụ");
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quản lý nhóm dịch vụ"
      size="lg"
    >
      <div className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Tìm kiếm nhóm dịch vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Create New Category */}
        {isCreating ? (
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
            <Input
              placeholder="Nhập tên nhóm dịch vụ..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleCreateCategory();
                if (e.key === "Escape") {
                  setIsCreating(false);
                  setNewCategoryName("");
                }
              }}
              autoFocus
            />
            <Button onClick={handleCreateCategory} disabled={loading} size="sm">
              Tạo
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewCategoryName("");
              }}
              size="sm"
            >
              Hủy
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsCreating(true)}
            variant="outline"
            className="w-full"
          >
            <Plus size={16} className="mr-2" />
            Tạo nhóm mới
          </Button>
        )}

        {/* Categories List */}
        <div className="border border-gray-200 rounded-lg divide-y max-h-96 overflow-y-auto">
          {filteredCategories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {searchTerm ? "Không tìm thấy nhóm dịch vụ" : "Chưa có nhóm dịch vụ"}
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div
                key={category.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                {editingCategory?.id === category.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editingCategory.name}
                      onChange={(e) =>
                        setEditingCategory({ ...editingCategory, name: e.target.value })
                      }
                      onKeyPress={(e) => {
                        if (e.key === "Enter") {
                          handleUpdateCategory(category.name, editingCategory.name);
                        }
                        if (e.key === "Escape") {
                          setEditingCategory(null);
                        }
                      }}
                      autoFocus
                    />
                    <Button
                      onClick={() =>
                        handleUpdateCategory(category.name, editingCategory.name)
                      }
                      disabled={loading}
                      size="sm"
                    >
                      Lưu
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setEditingCategory(null)}
                      size="sm"
                    >
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <FolderTree size={18} className="text-gray-400" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{category.name}</p>
                        <p className="text-sm text-gray-500">
                          {category.serviceCount} dịch vụ
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="text-primary-600 hover:text-primary-700"
                        title="Sửa"
                      >
                        <Edit size={16} />
                      </button>
                      {category.serviceCount === 0 ? (
                        <button
                          onClick={() => handleDeleteCategory(category.name)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDeleteCategory(category.name)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa (sẽ chuyển dịch vụ sang nhóm Khác)"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Khi xóa nhóm dịch vụ, tất cả dịch vụ trong nhóm sẽ được chuyển sang nhóm "Khác".
            Khi đổi tên nhóm, tất cả dịch vụ trong nhóm sẽ được cập nhật tự động.
          </p>
        </div>
      </div>
    </Modal>
  );
}
