"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Grid3x3,
  List,
  Scissors,
  DollarSign,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  image?: string;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  servicePrices: Array<{
    id: string;
    price: number;
    cost?: number;
    isActive: boolean;
  }>;
}

interface ServiceCategory {
  id: string;
  name: string;
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchServices();
    fetchCategories();
  }, [selectedCategory]);

  const fetchServices = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("categoryId", selectedCategory);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/services?${params.toString()}`);
      const result = await response.json();
      if (result.success) {
        setServices(result.data.services);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    // This would need a categories API endpoint
    // For now, extract unique categories from services
    const uniqueCategories = Array.from(
      new Map(services.map((s) => [s.category.id, s.category])).values()
    );
    setCategories(uniqueCategories);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa dịch vụ này?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
    }
  };

  const getCurrentPrice = (service: Service) => {
    const activePrice = service.servicePrices.find((p) => p.isActive);
    return activePrice?.price || 0;
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Services Matrix</h1>
            <p className="text-gray-500 mt-1">Quản lý dịch vụ salon</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={18} className="mr-2" />
            Thêm dịch vụ
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Tìm kiếm dịch vụ..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  fetchServices();
                }}
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded ${viewMode === "grid" ? "bg-primary-100 text-primary-600" : ""}`}
              >
                <Grid3x3 size={18} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded ${viewMode === "list" ? "bg-primary-100 text-primary-600" : ""}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </Card>

        {/* Services Grid/List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Đang tải...</div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {services.map((service) => (
              <Card
                key={service.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedService(service)}
              >
                {service.image && (
                  <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden mb-4">
                    <img
                      src={service.image}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{service.name}</h3>
                    {!service.isActive && (
                      <span className="text-xs text-red-600">Đã ngừng</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {service.description}
                  </p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock size={14} />
                      <span>{service.duration} phút</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary-600 font-semibold">
                      <DollarSign size={14} />
                      <span>{formatCurrency(getCurrentPrice(service))}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t">
                    <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                      {service.category.name}
                    </span>
                    <div className="flex-1" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedService(service);
                      }}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(service.id);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="divide-y">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedService(service)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {service.image && (
                        <img
                          src={service.image}
                          alt={service.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-500">{service.description}</p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500">
                            {service.category.name}
                          </span>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Clock size={14} />
                            <span>{service.duration} phút</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold text-primary-600">
                          {formatCurrency(getCurrentPrice(service))}
                        </p>
                        {!service.isActive && (
                          <p className="text-xs text-red-600">Đã ngừng</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(service);
                          }}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(service.id);
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Service Detail Modal */}
        {selectedService && (
          <Modal
            isOpen={!!selectedService}
            onClose={() => setSelectedService(null)}
            title={selectedService.name}
            size="lg"
          >
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Danh mục</p>
                <p className="text-gray-900">{selectedService.category.name}</p>
              </div>
              {selectedService.description && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Mô tả</p>
                  <p className="text-gray-900">{selectedService.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Thời lượng</p>
                  <p className="text-gray-900">{selectedService.duration} phút</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Giá hiện tại</p>
                  <p className="text-gray-900 font-semibold">
                    {formatCurrency(getCurrentPrice(selectedService))}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Lịch sử giá</p>
                <div className="space-y-2">
                  {selectedService.servicePrices.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <span className="font-medium">
                          {formatCurrency(price.price)}
                        </span>
                        {price.cost && (
                          <span className="text-sm text-gray-500 ml-2">
                            (Giá vốn: {formatCurrency(price.cost)})
                          </span>
                        )}
                      </div>
                      {price.isActive && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          Đang áp dụng
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </MainLayout>
  );
}
