"use client";

import React, { useState, useEffect } from "react";
import { Edit, Trash2, Phone, Mail, Calendar, MapPin, User, Star, Gift, FileText, Users, X, Save, Printer, ShoppingCart, BarChart3, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { Gender } from "@/features/crm/types";
import { saveCustomer } from "@/features/crm/services/crmApi";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  city?: string;
  province?: string;
  totalVisits: number;
  totalSpent: number;
  lastVisitDate?: string;
  loyaltyPoints: number;
  status: string;
  createdAt: string;
  notes?: string;
}

interface CustomerDetailPanelProps {
  customer: Customer | null;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

export default function CustomerDetailPanel({
  customer,
  onUpdate,
  onDelete,
}: CustomerDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      const dob = customer.dateOfBirth ? new Date(customer.dateOfBirth) : null;
      setFormData({
        fullName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
        phone: customer.phone || "",
        email: customer.email || "",
        dayOfBirth: dob ? dob.getDate().toString() : "",
        monthOfBirth: dob ? (dob.getMonth() + 1).toString() : "",
        yearOfBirth: dob ? dob.getFullYear().toString() : "",
        gender: customer.gender || Gender.FEMALE,
        address: customer.address || "",
        province: customer.province || "TP Hồ Chí Minh",
        district: customer.city || "Quận 1",
        notes: customer.notes || "",
      });
      setIsEditing(false);
    }
  }, [customer]);

  if (!customer) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <User size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Chọn khách hàng để xem chi tiết</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!formData) return;

    setError(null);
    setLoading(true);

    try {
      // Validate
      if (!formData.fullName || !formData.fullName.trim()) {
        setError("Họ tên là bắt buộc");
        setLoading(false);
        return;
      }

      if (!formData.phone || !formData.phone.trim()) {
        setError("Số điện thoại là bắt buộc");
        setLoading(false);
        return;
      }

      // Parse name
      const nameParts = formData.fullName.trim().split(" ");
      const lastName = nameParts.pop() || "";
      const firstName = nameParts.join(" ") || lastName;

      // Build date of birth
      let dateOfBirth = "";
      if (formData.yearOfBirth && formData.monthOfBirth && formData.dayOfBirth) {
        dateOfBirth = `${formData.yearOfBirth}-${formData.monthOfBirth.padStart(2, "0")}-${formData.dayOfBirth.padStart(2, "0")}`;
      }

      const requestData: any = {
        id: customer.id,
        firstName,
        lastName,
        phone: formData.phone,
        email: formData.email || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: formData.gender,
        address: formData.address || undefined,
        city: formData.district || undefined,
        province: formData.province || undefined,
        notes: formData.notes || undefined,
      };

      await saveCustomer(requestData);
      setIsEditing(false);
      onUpdate();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (customer) {
      const dob = customer.dateOfBirth ? new Date(customer.dateOfBirth) : null;
      setFormData({
        fullName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
        phone: customer.phone || "",
        email: customer.email || "",
        dayOfBirth: dob ? dob.getDate().toString() : "",
        monthOfBirth: dob ? (dob.getMonth() + 1).toString() : "",
        yearOfBirth: dob ? dob.getFullYear().toString() : "",
        gender: customer.gender || Gender.FEMALE,
        address: customer.address || "",
        province: customer.province || "TP Hồ Chí Minh",
        district: customer.city || "Quận 1",
        notes: customer.notes || "",
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const getInitials = () => {
    const first = customer.firstName?.[0]?.toUpperCase() || "";
    const last = customer.lastName?.[0]?.toUpperCase() || "";
    return `${first}${last}` || "?";
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <div className="flex-1 bg-white overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-gray-900">
            Thông tin khách hàng - {customer.id.slice(0, 8).toUpperCase()}
          </h2>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={loading}>
                  <X size={16} className="mr-1" />
                  Hủy
                </Button>
                <Button size="sm" onClick={handleSave} disabled={loading}>
                  <Save size={16} className="mr-1" />
                  {loading ? "Đang lưu..." : "Lưu"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => onDelete(customer.id)}>
                  <Trash2 size={16} className="mr-1" />
                  Xóa
                </Button>
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Edit size={16} className="mr-1" />
                  Sửa
                </Button>
              </>
            )}
          </div>
        </div>
        {error && (
          <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Profile Card */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl flex-shrink-0">
              {getInitials()}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {customer.firstName} {customer.lastName}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Khởi tạo lúc:</p>
                  <p className="font-medium">{formatDate(customer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ghé thăm lần cuối:</p>
                  <p className="font-medium">
                    {customer.lastVisitDate ? formatDate(customer.lastVisitDate) : "Chưa có"}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  Hạng Thường
                </span>
                <div className="flex items-center gap-1">
                  <Gift size={16} className="text-red-500" />
                  <span className="text-lg font-bold text-red-600">0</span>
                  <span className="text-sm text-gray-600">Điểm thưởng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Tổng số lần đặt trước</p>
              <p className="text-lg font-bold">{customer.totalVisits || 0} lần</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số lần đến trực tiếp</p>
              <p className="text-lg font-bold">0 lần</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số lần hủy đặt / không đến</p>
              <p className="text-lg font-bold">0 lần</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng chi tiêu</p>
              <p className="text-lg font-bold">{customer.totalSpent?.toLocaleString() || 0} ₫</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal" className="w-full">
          <TabsList>
            <TabsTrigger value="personal">Thông tin cá nhân</TabsTrigger>
            <TabsTrigger value="notes">Ghi chú</TabsTrigger>
            <TabsTrigger value="relatives">Người thân</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="mt-4 space-y-4">
            {isEditing ? (
              <>
                {/* Edit Mode */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mã khách hàng
                    </label>
                    <Input value={customer.id.slice(0, 8).toUpperCase()} disabled className="bg-gray-100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Họ tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData?.fullName || ""}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={formData?.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <Input
                      type="email"
                      value={formData?.email || ""}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={formData?.dayOfBirth || ""}
                        onChange={(e) => setFormData({ ...formData, dayOfBirth: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Ngày</option>
                        {days.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData?.monthOfBirth || ""}
                        onChange={(e) => setFormData({ ...formData, monthOfBirth: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Tháng</option>
                        {months.map((m) => (
                          <option key={m} value={m}>
                            {m}
                          </option>
                        ))}
                      </select>
                      <select
                        value={formData?.yearOfBirth || ""}
                        onChange={(e) => setFormData({ ...formData, yearOfBirth: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Năm</option>
                        {years.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value={Gender.MALE}
                          checked={formData?.gender === Gender.MALE}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        />
                        <span>Nam</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="gender"
                          value={Gender.FEMALE}
                          checked={formData?.gender === Gender.FEMALE}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                        />
                        <span>Nữ</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                    <Input
                      value={formData?.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Nhập địa chỉ"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* View Mode */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã khách hàng</label>
                    <p className="text-base text-gray-900">{customer.id.slice(0, 8).toUpperCase()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-400" />
                      <p className="text-base text-gray-900">{customer.phone}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    {customer.email ? (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.email}</p>
                      </div>
                    ) : (
                      <p className="text-base text-gray-400">Chưa có</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                    <p className="text-base text-gray-900">
                      {customer.gender === Gender.MALE ? "Nam" : customer.gender === Gender.FEMALE ? "Nữ" : "Chưa có"}
                    </p>
                  </div>

                  {customer.dateOfBirth && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{formatDate(customer.dateOfBirth)}</p>
                      </div>
                    </div>
                  )}

                  {customer.address && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.address}</p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {isEditing ? (
              <textarea
                value={formData?.notes || ""}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows={6}
                placeholder="Nhập ghi chú..."
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {customer.notes || "Chưa có ghi chú"}
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="relatives" className="mt-4">
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-4 text-gray-300" />
              <p>Chưa có thông tin người thân</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

