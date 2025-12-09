"use client";

import React, { useState, useEffect } from "react";
import { X, Save } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Customer, CreateCustomerRequest, UpdateCustomerRequest, Gender, CustomerStatus } from "@/features/crm/types";
import { saveCustomer } from "@/features/crm/services/crmApi";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
  onSuccess?: () => void;
}

export default function CustomerFormModal({
  isOpen,
  onClose,
  customer,
  onSuccess,
}: CustomerFormModalProps) {
  const [formData, setFormData] = useState<any>({
    customerCode: "",
    fullName: "",
    phone: "",
    email: "",
    dayOfBirth: "",
    monthOfBirth: "",
    yearOfBirth: "",
    gender: Gender.FEMALE,
    occupation: "",
    rank: "Hạng Thường",
    website: "",
    customerGroup: "",
    province: "TP Hồ Chí Minh",
    district: "Quận 1",
    address: "",
    country: "Việt Nam",
    cardId: "",
    zaloPhone: "",
    facebook: "",
    company: "",
    referralSource: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      // Parse date of birth
      const dob = customer.dateOfBirth ? new Date(customer.dateOfBirth) : null;
      setFormData({
        customerCode: customer.id || "",
        fullName: `${customer.firstName || ""} ${customer.lastName || ""}`.trim(),
        phone: customer.phone || "",
        email: customer.email || "",
        dayOfBirth: dob ? dob.getDate().toString() : "",
        monthOfBirth: dob ? (dob.getMonth() + 1).toString() : "",
        yearOfBirth: dob ? dob.getFullYear().toString() : "",
        gender: customer.gender || Gender.FEMALE,
        occupation: "",
        rank: "Hạng Thường",
        website: "",
        customerGroup: "",
        province: customer.province || "TP Hồ Chí Minh",
        district: customer.city || "Quận 1",
        address: customer.address || "",
        country: "Việt Nam",
        cardId: "",
        zaloPhone: "",
        facebook: "",
        company: "",
        referralSource: "",
        notes: customer.notes || "",
      });
    } else {
      // Reset form for new customer
      setFormData({
        customerCode: "",
        fullName: "",
        phone: "",
        email: "",
        dayOfBirth: "",
        monthOfBirth: "",
        yearOfBirth: "",
        gender: Gender.FEMALE,
        occupation: "",
        rank: "Hạng Thường",
        website: "",
        customerGroup: "",
        province: "TP Hồ Chí Minh",
        district: "Quận 1",
        address: "",
        country: "Việt Nam",
        cardId: "",
        zaloPhone: "",
        facebook: "",
        company: "",
        referralSource: "",
        notes: "",
      });
    }
    setError(null);
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Parse full name to firstName and lastName
      const nameParts = formData.fullName.trim().split(" ");
      const lastName = nameParts.pop() || "";
      const firstName = nameParts.join(" ") || "";

      // Build date of birth
      let dateOfBirth = "";
      if (formData.yearOfBirth && formData.monthOfBirth && formData.dayOfBirth) {
        dateOfBirth = `${formData.yearOfBirth}-${formData.monthOfBirth.padStart(2, "0")}-${formData.dayOfBirth.padStart(2, "0")}`;
      }

      // Split fullName into firstName and lastName
      const nameParts = formData.fullName.trim().split(" ");
      const lastName = nameParts.pop() || "";
      const firstName = nameParts.join(" ") || lastName;

      const requestData: any = {
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
          customerCode: formData.customerCode,
          occupation: formData.occupation,
          rank: formData.rank,
          website: formData.website,
          customerGroup: formData.customerGroup,
          country: formData.country,
          cardId: formData.cardId,
          zaloPhone: formData.zaloPhone,
          facebook: formData.facebook,
          company: formData.company,
          referralSource: formData.referralSource,
        },
      };

      if (customer) {
        // Update existing customer
        const updateRequest: UpdateCustomerRequest = {
          id: customer.id,
          ...requestData,
        };
        await saveCustomer(updateRequest);
      } else {
        // Create new customer
        await saveCustomer(requestData as CreateCustomerRequest);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi lưu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Generate days, months, years for dropdowns
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const provinces = ["TP Hồ Chí Minh", "Hà Nội", "Đà Nẵng", "Cần Thơ", "Hải Phòng"];
  const districts = ["Quận 1", "Quận 2", "Quận 3", "Quận 4", "Quận 5", "Quận 7", "Quận 8", "Quận 10", "Quận 11", "Quận 12"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={customer ? "Sửa thông tin khách hàng" : "Thêm khách hàng mới"}
      size="xl"
      footer={null}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Mã khách hàng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã khách hàng
              </label>
              <Input
                value={formData.customerCode}
                onChange={(e) => setFormData({ ...formData, customerCode: e.target.value })}
                placeholder="Tự động tạo"
                disabled={!!customer}
              />
            </div>

            {/* Họ tên */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ tên <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                placeholder="Nhập họ tên"
                className="bg-yellow-50"
              />
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0900000000"
              />
            </div>

            {/* Ngày sinh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ngày sinh
              </label>
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={formData.dayOfBirth}
                  onChange={(e) => setFormData({ ...formData, dayOfBirth: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                >
                  <option value="">Ngày</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.monthOfBirth}
                  onChange={(e) => setFormData({ ...formData, monthOfBirth: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                >
                  <option value="">Tháng</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.yearOfBirth}
                  onChange={(e) => setFormData({ ...formData, yearOfBirth: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
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

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>

            {/* Nghề nghiệp */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nghề nghiệp
              </label>
              <Input
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                placeholder="Nhập nghề nghiệp"
              />
            </div>

            {/* Hạng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hạng
              </label>
              <select
                value={formData.rank}
                onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
              >
                <option value="Hạng Thường">Hạng Thường</option>
                <option value="Hạng Bạc">Hạng Bạc</option>
                <option value="Hạng Vàng">Hạng Vàng</option>
                <option value="Hạng Kim Cương">Hạng Kim Cương</option>
              </select>
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Nhóm khách hàng */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nhóm khách hàng
              </label>
              <Input
                value={formData.customerGroup}
                onChange={(e) => setFormData({ ...formData, customerGroup: e.target.value })}
                placeholder="Nhập nhóm khách hàng"
              />
            </div>

            {/* Địa chỉ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <div className="space-y-2">
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                >
                  {provinces.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                >
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Địa chỉ"
                />
              </div>
            </div>

            {/* Quốc gia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quốc gia
              </label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
              >
                <option value="Việt Nam">Việt Nam</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ghi chú
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A4E3E3]"
                rows={3}
                placeholder="Ghi chú về khách hàng..."
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
            {/* Giới tính */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={Gender.MALE}
                    checked={formData.gender === Gender.MALE}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-4 h-4 text-[#A4E3E3]"
                  />
                  <span>Nam</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={Gender.FEMALE}
                    checked={formData.gender === Gender.FEMALE}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                    className="w-4 h-4 text-[#A4E3E3]"
                  />
                  <span>Nữ</span>
                </label>
              </div>
            </div>

            {/* Mã thẻ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã thẻ
              </label>
              <Input
                value={formData.cardId}
                onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                placeholder="Nhập mã thẻ"
              />
            </div>

            {/* Số ĐT Zalo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số ĐT Zalo
              </label>
              <Input
                type="tel"
                value={formData.zaloPhone}
                onChange={(e) => setFormData({ ...formData, zaloPhone: e.target.value })}
                placeholder="0900000000"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Facebook
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-bold">
                  f
                </div>
                <Input
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  placeholder="facebook ID"
                  className="pl-8"
                />
              </div>
            </div>

            {/* Công ty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Công ty
              </label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Nhập tên công ty"
              />
            </div>

            {/* Nguồn giới thiệu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nguồn giới thiệu
              </label>
              <Input
                value={formData.referralSource}
                onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                placeholder="Nhập nguồn giới thiệu"
              />
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Đóng
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
            style={{ backgroundColor: "#A4E3E3", color: "#0c4a6e" }}
          >
            <Save className="w-4 h-4" />
            {loading ? "Đang lưu..." : "Lưu thông tin"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

