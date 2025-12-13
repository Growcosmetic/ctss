"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, Loader2, Save } from "lucide-react";

interface Staff {
  id: string;
  employeeId: string | null;
  position: string | null;
  hireDate: string | null;
  salary: number | null;
  commissionRate: number | null;
  specialization: string | null;
  isActive: boolean;
  user: {
    id: string;
    name: string;
    phone: string;
    role: string;
    branchId: string | null;
  };
  staffServices?: Array<{
    service: {
      id: string;
      name: string;
    };
  }>;
}

interface Service {
  id: string;
  name: string;
  category: string;
}

interface StaffFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  staff?: Staff | null;
}

export default function StaffFormModal({
  isOpen,
  onClose,
  onSuccess,
  staff,
}: StaffFormModalProps) {
  const [loading, setLoading] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [error, setError] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [branches, setBranches] = useState<Array<{ id: string; name: string }>>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    password: "",
    role: "STYLIST" as "STYLIST" | "ASSISTANT" | "RECEPTIONIST",
    branchId: "",
    employeeId: "",
    position: "",
    hireDate: "",
    salary: "",
    commissionRate: "",
    specialization: "",
    serviceIds: [] as string[],
  });

  useEffect(() => {
    if (isOpen) {
      loadServices();
      loadBranches();
      if (staff) {
        // Edit mode
        setFormData({
          name: staff.user.name,
          phone: staff.user.phone,
          password: "", // Don't pre-fill password
          role: staff.user.role as "STYLIST" | "ASSISTANT" | "RECEPTIONIST",
          branchId: staff.user.branchId || "",
          employeeId: staff.employeeId || "",
          position: staff.position || "",
          hireDate: staff.hireDate ? new Date(staff.hireDate).toISOString().split("T")[0] : "",
          salary: staff.salary?.toString() || "",
          commissionRate: staff.commissionRate?.toString() || "",
          specialization: staff.specialization || "",
          serviceIds: staff.staffServices?.map((ss) => ss.service.id) || [],
        });
      } else {
        // Create mode
        setFormData({
          name: "",
          phone: "",
          password: "",
          role: "STYLIST",
          branchId: "",
          employeeId: "",
          position: "",
          hireDate: "",
          salary: "",
          commissionRate: "",
          specialization: "",
          serviceIds: [],
        });
      }
      setError("");
    }
  }, [isOpen, staff]);

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch("/api/services?isActive=true", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setServices(result.data?.services || result.services || []);
        }
      }
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const loadBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await fetch("/api/branches", {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setBranches(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      setError("Tên và số điện thoại là bắt buộc");
      return;
    }

    if (!staff && !formData.password) {
      setError("Mật khẩu là bắt buộc khi tạo mới");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (staff) {
        // Update staff
        const response = await fetch(`/api/staff/${staff.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            position: formData.position || null,
            hireDate: formData.hireDate || null,
            salary: formData.salary ? parseFloat(formData.salary) : null,
            commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
            specialization: formData.specialization || null,
            isActive: true,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Không thể cập nhật nhân viên");
        }

        alert("✅ Cập nhật nhân viên thành công!");
      } else {
        // Create staff
        const response = await fetch("/api/staff", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            password: formData.password,
            role: formData.role,
            branchId: formData.branchId || null,
            employeeId: formData.employeeId || null,
            position: formData.position || null,
            hireDate: formData.hireDate || null,
            salary: formData.salary ? parseFloat(formData.salary) : null,
            commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
            specialization: formData.specialization || null,
            serviceIds: formData.serviceIds,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.error || "Không thể tạo nhân viên");
        }

        alert("✅ Tạo nhân viên thành công!");
      }

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Error saving staff:", err);
      setError(err.message || "Có lỗi xảy ra khi lưu nhân viên");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={staff ? "Sửa nhân viên" : "Thêm nhân viên mới"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nhân viên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!staff}
              />
            </div>

            {!staff && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vai trò <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    role: e.target.value as "STYLIST" | "ASSISTANT" | "RECEPTIONIST",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!!staff}
              >
                <option value="STYLIST">Stylist</option>
                <option value="ASSISTANT">Phụ tá</option>
                <option value="RECEPTIONIST">Lễ tân</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chi nhánh
              </label>
              <select
                value={formData.branchId}
                onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loadingBranches}
              >
                <option value="">-- Chọn chi nhánh --</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Staff Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Thông tin nhân viên</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã nhân viên
              </label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tự động sinh nếu để trống"
                disabled={!!staff}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vị trí
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Senior Stylist"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày vào làm
              </label>
              <input
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lương cơ bản (₫)
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỷ lệ hoa hồng (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commissionRate}
                onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chuyên môn
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Uốn, Nhuộm, Cắt"
              />
            </div>
          </div>
        </div>

        {/* Services */}
        {!staff && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Dịch vụ có thể làm</h3>
            {loadingServices ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {services.length === 0 ? (
                  <p className="text-sm text-gray-500">Không có dịch vụ nào</p>
                ) : (
                  <div className="space-y-2">
                    {services.map((service) => (
                      <label
                        key={service.id}
                        className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={formData.serviceIds.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                serviceIds: [...formData.serviceIds, service.id],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                serviceIds: formData.serviceIds.filter((id) => id !== service.id),
                              });
                            }
                          }}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">
                          {service.name} ({service.category})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {staff ? "Cập nhật" : "Tạo mới"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
