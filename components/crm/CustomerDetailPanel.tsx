"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Edit, Trash2, Phone, Mail, Calendar, MapPin, User, Star, Gift, FileText, Users, X, Save, Printer, ShoppingCart, BarChart3, Lock, Plus, Facebook, Globe, CreditCard, Briefcase, Building, Hash, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Gender } from "@/features/crm/types";
import { saveCustomer } from "@/features/crm/services/crmApi";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";

interface Customer {
  id: string;
  name?: string; // API có thể trả về name
  firstName?: string;
  lastName?: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  birthday?: string; // API có thể trả về birthday
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
  profile?: {
    preferences?: {
      email?: string;
      address?: string;
      city?: string;
      province?: string;
      rank?: string;
      customerGroup?: string;
      referralSource?: string;
      facebook?: string;
      zaloPhone?: string;
      zaloAccount?: string;
      website?: string;
      height?: string;
      weight?: string;
      cardId?: string;
      occupation?: string;
      company?: string;
      taxId?: string;
      country?: string;
    };
  };
}

interface CustomerDetailPanelProps {
  customer: Customer | null;
  onUpdate: () => void;
  onDelete: (id: string) => void;
  onPrintReceipt?: (customerId: string) => void;
  onCreateOrder?: (customerId: string) => void;
  onBookAppointment?: (customerId: string) => void;
  onViewPoints?: (customerId: string) => void;
  onLockZalo?: (customerId: string) => void;
  onManageGroups?: () => void;
  allCustomers?: Customer[]; // Pass all customers to extract groups
  onAddToGroup?: (customerId: string, groupName: string) => Promise<void>; // Handler to add/move customer to group
}

export default function CustomerDetailPanel({
  customer,
  onUpdate,
  onDelete,
  onPrintReceipt,
  onCreateOrder,
  onBookAppointment,
  onViewPoints,
  onLockZalo,
  onManageGroups,
  allCustomers = [],
  onAddToGroup,
}: CustomerDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  // Extract available groups from API and customers
  const [availableGroups, setAvailableGroups] = React.useState<string[]>([]);

  React.useEffect(() => {
    const loadGroups = async () => {
      try {
        // Fetch groups from API (includes persisted groups)
        const response = await fetch("/api/crm/groups");
        const result = await response.json();
        
        if (result.success) {
          const apiGroups = result.data.map((g: any) => g.name).filter((name: string) => name !== "Chưa phân nhóm");
          
          // Also extract from current customers
          const customerGroups = new Set<string>();
          allCustomers.forEach((c) => {
            const groupName = c.profile?.preferences?.customerGroup;
            if (groupName && groupName !== "Chưa phân nhóm") {
              customerGroups.add(groupName);
            }
          });
          
          // Merge and sort
          const mergedGroups = Array.from(new Set([...apiGroups, ...Array.from(customerGroups)])).sort();
          setAvailableGroups(mergedGroups);
        } else {
          // Fallback: extract from customers only
          const groupSet = new Set<string>();
          allCustomers.forEach((c) => {
            const groupName = c.profile?.preferences?.customerGroup;
            if (groupName && groupName !== "Chưa phân nhóm") {
              groupSet.add(groupName);
            }
          });
          setAvailableGroups(Array.from(groupSet).sort());
        }
      } catch (error) {
        console.error("Error loading groups:", error);
        // Fallback: extract from customers only
        const groupSet = new Set<string>();
        allCustomers.forEach((c) => {
          const groupName = c.profile?.preferences?.customerGroup;
          if (groupName && groupName !== "Chưa phân nhóm") {
            groupSet.add(groupName);
          }
        });
        setAvailableGroups(Array.from(groupSet).sort());
      }
    };

    loadGroups();
  }, [allCustomers]);

  useEffect(() => {
    if (customer) {
      // Parse name nếu có
      const fullName = customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Khách hàng";
      const dob = customer.dateOfBirth ? new Date(customer.dateOfBirth) : 
                   customer.birthday ? new Date(customer.birthday) : null;
      const prefs = customer.profile?.preferences || {};
      setFormData({
        fullName,
        phone: customer.phone || "",
        email: customer.email || prefs.email || "",
        dayOfBirth: dob ? dob.getDate().toString() : "",
        monthOfBirth: dob ? (dob.getMonth() + 1).toString() : "",
        yearOfBirth: dob ? dob.getFullYear().toString() : "",
        gender: customer.gender || Gender.FEMALE,
        address: customer.address || prefs.address || "",
        province: customer.province || prefs.province || "TP Hồ Chí Minh",
        district: customer.city || prefs.city || "Quận 1",
        notes: customer.notes || "",
        // Extended fields from preferences
        customerGroup: prefs.customerGroup || "",
        referralSource: prefs.referralSource || "",
        facebook: prefs.facebook || "",
        zaloPhone: prefs.zaloPhone || "",
        zaloAccount: prefs.zaloAccount || "",
        website: prefs.website || "",
        height: prefs.height || "",
        weight: prefs.weight || "",
        cardId: prefs.cardId || "",
        occupation: prefs.occupation || "",
        company: prefs.company || "",
        taxId: prefs.taxId || "",
        country: prefs.country || "VN",
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
        preferences: {
          email: formData.email || undefined,
          address: formData.address || undefined,
          city: formData.district || undefined,
          province: formData.province || undefined,
          country: formData.country || undefined,
          facebook: formData.facebook || undefined,
          zaloPhone: formData.zaloPhone || undefined,
          zaloAccount: formData.zaloAccount || undefined,
          website: formData.website || undefined,
          height: formData.height || undefined,
          weight: formData.weight || undefined,
          cardId: formData.cardId || undefined,
          occupation: formData.occupation || undefined,
          company: formData.company || undefined,
          taxId: formData.taxId || undefined,
          referralSource: formData.referralSource || undefined,
          customerGroup: formData.customerGroup || undefined,
        },
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
    const fullName = customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Khách hàng";
    const nameParts = fullName.trim().split(" ");
    const first = nameParts[0]?.[0]?.toUpperCase() || "";
    const last = nameParts[nameParts.length - 1]?.[0]?.toUpperCase() || "";
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
                {customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || "Khách hàng"}
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
              <div className="mt-3 flex items-center gap-4 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {customer.profile?.preferences?.rank || "Hạng Thường"}
                </span>
                <div className="relative">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs flex items-center gap-1 text-blue-700"
                    onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                  >
                    <Plus size={14} />
                    {customer?.profile?.preferences?.customerGroup || "Thêm nhóm khách hàng"}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  
                  {isGroupDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10" 
                        onClick={() => setIsGroupDropdownOpen(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                        <div className="py-1">
                          {availableGroups.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              Chưa có nhóm nào
                            </div>
                          ) : (
                            availableGroups.map((group) => (
                              <button
                                key={group}
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (onAddToGroup && customer) {
                                    try {
                                      setIsGroupDropdownOpen(false);
                                      await onAddToGroup(customer.id, group);
                                      await onUpdate();
                                    } catch (error: any) {
                                      console.error("Error adding to group:", error);
                                      alert(error.message || "Có lỗi xảy ra khi thêm khách hàng vào nhóm");
                                    }
                                  } else {
                                    setIsGroupDropdownOpen(false);
                                  }
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                  customer?.profile?.preferences?.customerGroup === group ? "bg-blue-50 text-blue-700" : "text-gray-700"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span>{group}</span>
                                  {customer?.profile?.preferences?.customerGroup === group && (
                                    <Check size={16} className="text-blue-600" />
                                  )}
                                </div>
                              </button>
                            ))
                          )}
                          
                          <div className="border-t border-gray-200 mt-1 pt-1">
                            <button
                              onClick={() => {
                                setIsGroupDropdownOpen(false);
                                if (onManageGroups) {
                                  onManageGroups();
                                }
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2"
                            >
                              <Plus size={16} />
                              Tạo nhóm mới
                            </button>
                            
                            {customer?.profile?.preferences?.customerGroup && (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (onAddToGroup && customer) {
                                    try {
                                      setIsGroupDropdownOpen(false);
                                      await onAddToGroup(customer.id, "");
                                      await onUpdate();
                                    } catch (error: any) {
                                      console.error("Error removing from group:", error);
                                      alert(error.message || "Có lỗi xảy ra khi xóa khách hàng khỏi nhóm");
                                    }
                                  } else {
                                    setIsGroupDropdownOpen(false);
                                  }
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                              >
                                Xóa khỏi nhóm hiện tại
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Gift size={16} className="text-red-500" />
                  <span className="text-lg font-bold text-red-600">{customer.loyaltyPoints || 0}</span>
                  <span className="text-sm text-gray-600">Điểm thưởng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-600">Tổng số lần đặt trước</p>
              <p className="text-lg font-bold">{customer.totalVisits || 0} (lần)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số lần đặt từ app</p>
              <p className="text-lg font-bold">0 (lần)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số lần đến trực tiếp</p>
              <p className="text-lg font-bold">0 (lần)</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng số lần hủy đặt / không đến</p>
              <p className="text-lg font-bold">0 (lần)</p>
            </div>
          </div>
          
          {/* Referral Source */}
          {customer.profile?.preferences?.referralSource && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">Nguồn giới thiệu:</p>
              <p className="text-base font-medium text-gray-900">{customer.profile.preferences.referralSource}</p>
            </div>
          )}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Quận</label>
                      <Input
                        value={formData?.district || ""}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        placeholder="Quận 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                      <Input
                        value={formData?.province || ""}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        placeholder="TP Hồ Chí Minh"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                    <div className="relative">
                      <Facebook size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600" />
                      <Input
                        value={formData?.facebook || ""}
                        onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                        placeholder="Facebook ID"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số ĐT Zalo</label>
                    <Input
                      type="tel"
                      value={formData?.zaloPhone || ""}
                      onChange={(e) => setFormData({ ...formData, zaloPhone: e.target.value })}
                      placeholder="0900000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">T.khoản liên kết Zalo</label>
                    <Input
                      value={formData?.zaloAccount || ""}
                      onChange={(e) => setFormData({ ...formData, zaloAccount: e.target.value })}
                      placeholder="Zalo account"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                    <div className="relative">
                      <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={formData?.website || ""}
                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                        placeholder="https://..."
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao</label>
                      <Input
                        value={formData?.height || ""}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="cm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng</label>
                      <Input
                        value={formData?.weight || ""}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                        placeholder="kg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã thẻ</label>
                    <div className="relative">
                      <CreditCard size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={formData?.cardId || ""}
                        onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                        placeholder="Mã thẻ"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp</label>
                    <div className="relative">
                      <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={formData?.occupation || ""}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="Nghề nghiệp"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                    <div className="relative">
                      <Building size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={formData?.company || ""}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Tên công ty"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                    <div className="relative">
                      <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <Input
                        value={formData?.taxId || ""}
                        onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                        placeholder="Mã số thuế"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                    <Input
                      value={formData?.country || "VN"}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="VN"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nhóm khách hàng</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={formData?.customerGroup || ""}
                        onChange={(e) => setFormData({ ...formData, customerGroup: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Chưa phân nhóm</option>
                        {availableGroups.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (onManageGroups) {
                            onManageGroups();
                          }
                        }}
                        className="whitespace-nowrap"
                      >
                        <Plus size={14} className="mr-1" />
                        Tạo nhóm
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nguồn giới thiệu</label>
                    <Input
                      value={formData?.referralSource || ""}
                      onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                      placeholder="Nguồn giới thiệu"
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
                    {customer.email || customer.profile?.preferences?.email ? (
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.email || customer.profile?.preferences?.email}</p>
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

                  {(customer.dateOfBirth || customer.birthday) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">
                          {formatDate(customer.dateOfBirth || customer.birthday || "")}
                        </p>
                      </div>
                    </div>
                  )}

                  {(customer.profile?.preferences?.height || customer.profile?.preferences?.weight) && (
                    <div className="grid grid-cols-2 gap-4">
                      {customer.profile?.preferences?.height && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chiều cao</label>
                          <p className="text-base text-gray-900">{customer.profile.preferences.height} cm</p>
                        </div>
                      )}
                      {customer.profile?.preferences?.weight && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Cân nặng</label>
                          <p className="text-base text-gray-900">{customer.profile.preferences.weight} kg</p>
                        </div>
                      )}
                    </div>
                  )}

                  {customer.profile?.preferences?.cardId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã thẻ</label>
                      <div className="flex items-center gap-2">
                        <CreditCard size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.profile.preferences.cardId}</p>
                      </div>
                    </div>
                  )}

                  {(customer.address || customer.profile?.preferences?.address) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">
                          {customer.address || customer.profile?.preferences?.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {(customer.profile?.preferences?.city || customer.city) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Quận</label>
                      <p className="text-base text-gray-900">
                        {customer.profile?.preferences?.city || customer.city}
                      </p>
                    </div>
                  )}

                  {(customer.profile?.preferences?.province || customer.province) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                      <p className="text-base text-gray-900">
                        {customer.profile?.preferences?.province || customer.province}
                      </p>
                    </div>
                  )}

                  {customer.profile?.preferences?.facebook && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <div className="flex items-center gap-2">
                        <Facebook size={16} className="text-blue-600" />
                        <p className="text-base text-gray-900">{customer.profile.preferences.facebook}</p>
                      </div>
                    </div>
                  )}

                  {customer.profile?.preferences?.zaloPhone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số ĐT Zalo</label>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.profile.preferences.zaloPhone}</p>
                      </div>
                    </div>
                  )}

                  {customer.profile?.preferences?.zaloAccount && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">T.khoản liên kết Zalo</label>
                      <p className="text-base text-gray-900">{customer.profile.preferences.zaloAccount}</p>
                    </div>
                  )}

                  {customer.profile?.preferences?.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <div className="flex items-center gap-2">
                        <Globe size={16} className="text-gray-400" />
                        <a href={customer.profile.preferences.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {customer.profile.preferences.website}
                        </a>
                      </div>
                    </div>
                  )}

                  {customer.profile?.preferences?.occupation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nghề nghiệp</label>
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.profile.preferences.occupation}</p>
                      </div>
                    </div>
                  )}

                  {customer.profile?.preferences?.company && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Công ty</label>
                      <div className="flex items-center gap-2">
                        <Building size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.profile.preferences.company}</p>
                      </div>
                    </div>
                  )}

                  {customer.profile?.preferences?.taxId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                      <div className="flex items-center gap-2">
                        <Hash size={16} className="text-gray-400" />
                        <p className="text-base text-gray-900">{customer.profile.preferences.taxId}</p>
                      </div>
                    </div>
                  )}

                  {customer.profile?.preferences?.country && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
                      <p className="text-base text-gray-900">{customer.profile.preferences.country}</p>
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

        {/* Bottom Action Bar */}
        {customer && (
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex items-center justify-center gap-3 mt-auto">
            <Button variant="outline" size="sm" onClick={() => onPrintReceipt?.(customer.id)}>
              <Printer size={16} className="mr-2" />
              In phiếu
            </Button>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => onCreateOrder?.(customer.id)}>
              <ShoppingCart size={16} className="mr-2" />
              Tạo Đơn Hàng
            </Button>
            <Button variant="outline" size="sm" onClick={() => onBookAppointment?.(customer.id)}>
              <Calendar size={16} className="mr-2" />
              Đặt lịch
            </Button>
            <Button variant="outline" size="sm" onClick={() => onViewPoints?.(customer.id)}>
              <BarChart3 size={16} className="mr-2" />
              Điểm
            </Button>
            <Button variant="outline" size="sm" onClick={() => onLockZalo?.(customer.id)}>
              <Lock size={16} className="mr-2" />
              Khoá gửi Zalo
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

