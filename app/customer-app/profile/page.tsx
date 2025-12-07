"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCustomerAuth } from "@/features/customer-app/hooks/useCustomerAuth";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "@/features/customer-app/services/customerApi";
import CustomerNavBar from "@/features/customer-app/components/CustomerNavBar";
import { Loader2, Save, LogOut } from "lucide-react";
import { format } from "date-fns";

export default function CustomerProfilePage() {
  const { customer, authenticated, loading: authLoading, logout } =
    useCustomerAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthday: "",
    gender: "",
    notes: "",
  });

  useEffect(() => {
    if (!authenticated && !authLoading) {
      router.push("/customer-app/login");
      return;
    }

    if (customer) {
      loadProfile();
    }
  }, [customer, authenticated, authLoading]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await getCustomerProfile();
      setForm({
        firstName: data.firstName || "",
        lastName: data.lastName || "",
        birthday: data.birthday
          ? format(new Date(data.birthday), "yyyy-MM-dd")
          : "",
        gender: data.gender || "",
        notes: data.notes || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateCustomerProfile(form);
      alert("Đã cập nhật thông tin thành công!");
    } catch (error: any) {
      alert(error.message || "Lỗi khi cập nhật");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-6">
          <h1 className="text-2xl font-bold">Thông tin cá nhân</h1>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                value={customer?.phone || ""}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Số điện thoại không thể thay đổi
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh
              </label>
              <input
                type="date"
                value={form.birthday}
                onChange={(e) => setForm({ ...form, birthday: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Chọn giới tính</option>
                <option value="MALE">Nam</option>
                <option value="FEMALE">Nữ</option>
                <option value="OTHER">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú về tóc (mục tiêu, tình trạng)
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Ví dụ: Muốn tóc dài hơn, tóc hơi khô..."
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Lưu thay đổi
                </>
              )}
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full bg-red-50 text-red-600 py-3 rounded-lg font-semibold border border-red-200 hover:bg-red-100 flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </div>
      <CustomerNavBar />
    </>
  );
}

