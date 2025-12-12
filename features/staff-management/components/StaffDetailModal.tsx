"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { X, UserCircle, Phone, Briefcase, Calendar, DollarSign, Percent, Award } from "lucide-react";

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
    createdAt: string;
  };
  staffServices?: Array<{
    service: {
      id: string;
      name: string;
    };
  }>;
}

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

export default function StaffDetailModal({
  isOpen,
  onClose,
  staff,
}: StaffDetailModalProps) {
  const [detailedStaff, setDetailedStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && staff) {
      loadStaffDetail(staff.id);
    }
  }, [isOpen, staff]);

  const loadStaffDetail = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/staff/${id}`, {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setDetailedStaff(result.data);
        }
      }
    } catch (error) {
      console.error("Error loading staff detail:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !staff) return null;

  const displayStaff = detailedStaff || staff;

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      STYLIST: "Stylist",
      ASSISTANT: "Phụ tá",
      RECEPTIONIST: "Lễ tân",
      MANAGER: "Quản lý",
      ADMIN: "Quản trị",
    };
    return labels[role] || role;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết nhân viên"
      size="lg"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              Thông tin cơ bản
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Tên nhân viên</label>
                <p className="text-base text-gray-900 mt-1">{displayStaff.user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Số điện thoại
                </label>
                <p className="text-base text-gray-900 mt-1">{displayStaff.user.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Mã nhân viên</label>
                <p className="text-base text-gray-900 mt-1">
                  {displayStaff.employeeId || "--"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Vai trò</label>
                <p className="text-base text-gray-900 mt-1">
                  {getRoleLabel(displayStaff.user.role)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  Vị trí
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {displayStaff.position || "--"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Ngày vào làm
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {displayStaff.hireDate
                    ? new Date(displayStaff.hireDate).toLocaleDateString("vi-VN")
                    : "--"}
                </p>
              </div>
            </div>
          </div>

          {/* Salary Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Thông tin lương
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Lương cơ bản</label>
                <p className="text-base text-gray-900 mt-1">
                  {displayStaff.salary
                    ? `${displayStaff.salary.toLocaleString("vi-VN")} ₫`
                    : "--"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Percent className="w-4 h-4" />
                  Tỷ lệ hoa hồng
                </label>
                <p className="text-base text-gray-900 mt-1">
                  {displayStaff.commissionRate
                    ? `${displayStaff.commissionRate}%`
                    : "--"}
                </p>
              </div>
            </div>
          </div>

          {/* Specialization */}
          {displayStaff.specialization && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Chuyên môn
              </h3>
              <p className="text-base text-gray-900">{displayStaff.specialization}</p>
            </div>
          )}

          {/* Services */}
          {displayStaff.staffServices && displayStaff.staffServices.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Dịch vụ có thể làm
              </h3>
              <div className="space-y-2">
                {displayStaff.staffServices.map((ss) => (
                  <div
                    key={ss.service.id}
                    className="bg-white px-3 py-2 rounded border border-gray-200"
                  >
                    <p className="text-sm text-gray-900">{ss.service.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="text-sm font-medium text-gray-500">Trạng thái</label>
            <p className="mt-1">
              <span
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  displayStaff.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {displayStaff.isActive ? "Hoạt động" : "Vô hiệu hóa"}
              </span>
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
