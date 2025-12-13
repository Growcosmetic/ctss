"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import RoleGuard from "@/features/auth/components/RoleGuard";
import { CTSSRole } from "@/features/auth/types";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Building2, Plus, Edit2, Trash2, Search } from "lucide-react";

interface Salon {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  _count?: {
    users: number;
    customers: number;
    bookings: number;
  };
}

export default function SalonsManagementPage() {
  const router = useRouter();
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState<Salon | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    loadSalons();
  }, [search]);

  const loadSalons = async () => {
    setLoading(true);
    try {
      const url = search
        ? `/api/admin/salons?search=${encodeURIComponent(search)}`
        : "/api/admin/salons";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setSalons(data.data.salons || []);
      }
    } catch (error) {
      console.error("Failed to load salons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await fetch("/api/admin/salons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setFormData({ name: "", slug: "", status: "ACTIVE" });
        loadSalons();
      } else {
        alert(data.error || "Failed to create salon");
      }
    } catch (error) {
      alert("Failed to create salon");
    }
  };

  const handleEdit = (salon: Salon) => {
    setEditingSalon(salon);
    setFormData({
      name: salon.name,
      slug: salon.slug,
      status: salon.status,
    });
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingSalon) return;
    try {
      const res = await fetch(`/api/admin/salons/${editingSalon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditModalOpen(false);
        setEditingSalon(null);
        setFormData({ name: "", slug: "", status: "ACTIVE" });
        loadSalons();
      } else {
        alert(data.error || "Failed to update salon");
      }
    } catch (error) {
      alert("Failed to update salon");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  return (
    <RoleGuard roles={[CTSSRole.ADMIN]}>
      <MainLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Salon</h1>

          {/* Header Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Tìm kiếm salon..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button
              onClick={() => {
                setFormData({ name: "", slug: "", status: "ACTIVE" });
                setIsCreateModalOpen(true);
              }}
              variant="primary"
            >
              <Plus size={18} className="mr-2" />
              Tạo Salon mới
            </Button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-12">⏳ Đang tải...</div>
          ) : salons.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không có salon nào
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Tên Salon
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Slug
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Thống kê
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {salons.map((salon) => (
                    <tr key={salon.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 size={18} className="text-blue-600" />
                          <span className="font-medium text-gray-900">{salon.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {salon.slug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            salon.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {salon.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {salon._count && (
                          <div className="space-y-1">
                            <div>👥 {salon._count.users} users</div>
                            <div>👤 {salon._count.customers} customers</div>
                            <div>📅 {salon._count.bookings} bookings</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(salon)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Chỉnh sửa"
                          >
                            <Edit2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create Modal */}
          <Modal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            title="Tạo Salon mới"
            size="md"
            footer={
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleCreate}>
                  Tạo
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <Input
                label="Tên Salon *"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name,
                    slug: generateSlug(name),
                  });
                }}
                placeholder="Ví dụ: Chí Tâm Hair Salon"
              />
              <Input
                label="Slug *"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="chi-tam-hair-salon"
                helperText="Chỉ chứa chữ thường, số và dấu gạch ngang"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </Modal>

          {/* Edit Modal */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingSalon(null);
            }}
            title="Chỉnh sửa Salon"
            size="md"
            footer={
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingSalon(null);
                  }}
                >
                  Hủy
                </Button>
                <Button variant="primary" onClick={handleUpdate}>
                  Lưu
                </Button>
              </div>
            }
          >
            <div className="space-y-4">
              <Input
                label="Tên Salon *"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name,
                    slug: editingSalon?.slug || generateSlug(name),
                  });
                }}
                placeholder="Ví dụ: Chí Tâm Hair Salon"
              />
              <Input
                label="Slug *"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="chi-tam-hair-salon"
                helperText="Chỉ chứa chữ thường, số và dấu gạch ngang"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
            </div>
          </Modal>
        </div>
      </MainLayout>
    </RoleGuard>
  );
}

