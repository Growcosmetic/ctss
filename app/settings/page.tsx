"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import {
  Save,
  Building2,
  Bell,
  Shield,
  Plug,
  Settings as SettingsIcon,
} from "lucide-react";

interface Setting {
  key: string;
  value: string;
  type: string;
  category: string;
  description?: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Record<string, Setting[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const result = await response.json();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    const category = Object.keys(settings).find((cat) =>
      settings[cat].some((s) => s.key === key)
    );
    if (category) {
      setSettings({
        ...settings,
        [category]: settings[category].map((s) =>
          s.key === key ? { ...s, value } : s
        ),
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const allSettings = Object.values(settings).flat();
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: allSettings.map((s) => ({
            key: s.key,
            value: s.value,
            type: s.type,
            category: s.category,
            description: s.description,
          })),
          updatedBy: "system",
        }),
      });

      const result = await response.json();
      if (result.success) {
        alert("Đã lưu cài đặt thành công!");
      } else {
        alert("Lưu cài đặt thất bại");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Lưu cài đặt thất bại");
    } finally {
      setSaving(false);
    }
  };

  const getSettingValue = (category: string, key: string): string => {
    return settings[category]?.find((s) => s.key === key)?.value || "";
  };

  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case "BOOLEAN":
        return (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={setting.value === "true"}
              onChange={(e) => updateSetting(setting.key, e.target.checked.toString())}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">{setting.description}</span>
          </label>
        );
      case "NUMBER":
        return (
          <Input
            type="number"
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
          />
        );
      default:
        return (
          <Input
            value={setting.value}
            onChange={(e) => updateSetting(setting.key, e.target.value)}
          />
        );
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
            <p className="text-gray-500 mt-1">Quản lý cài đặt hệ thống</p>
          </div>
          <Button onClick={handleSave} isLoading={saving}>
            <Save size={18} className="mr-2" />
            Lưu tất cả
          </Button>
        </div>

        {/* Settings Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="general">
                <SettingsIcon size={16} className="mr-2" />
                Tổng quan
              </TabsTrigger>
              <TabsTrigger value="business">
                <Building2 size={16} className="mr-2" />
                Kinh doanh
              </TabsTrigger>
              <TabsTrigger value="notifications">
                <Bell size={16} className="mr-2" />
                Thông báo
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield size={16} className="mr-2" />
                Bảo mật
              </TabsTrigger>
              <TabsTrigger value="integrations">
                <Plug size={16} className="mr-2" />
                Tích hợp
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-6">
              {loading ? (
                <div className="text-center py-12 text-gray-400">Đang tải...</div>
              ) : (
                <div className="space-y-6">
                  {/* General Settings */}
                  {activeTab === "general" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên ứng dụng
                        </label>
                        <Input
                          value={getSettingValue("general", "app_name")}
                          onChange={(e) => updateSetting("app_name", e.target.value)}
                          placeholder="CTSS"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mô tả
                        </label>
                        <Input
                          value={getSettingValue("general", "app_description")}
                          onChange={(e) => updateSetting("app_description", e.target.value)}
                          placeholder="Hệ thống quản lý salon"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ
                        </label>
                        <Input
                          value={getSettingValue("general", "address")}
                          onChange={(e) => updateSetting("address", e.target.value)}
                          placeholder="Địa chỉ salon"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <Input
                          value={getSettingValue("general", "phone")}
                          onChange={(e) => updateSetting("phone", e.target.value)}
                          placeholder="0123456789"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <Input
                          type="email"
                          value={getSettingValue("general", "email")}
                          onChange={(e) => updateSetting("email", e.target.value)}
                          placeholder="contact@ctss.com"
                        />
                      </div>
                    </div>
                  )}

                  {/* Business Settings */}
                  {activeTab === "business" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mã số thuế
                        </label>
                        <Input
                          value={getSettingValue("business", "tax_id")}
                          onChange={(e) => updateSetting("tax_id", e.target.value)}
                          placeholder="1234567890"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ mở cửa
                        </label>
                        <Input
                          type="time"
                          value={getSettingValue("business", "open_time")}
                          onChange={(e) => updateSetting("open_time", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Giờ đóng cửa
                        </label>
                        <Input
                          type="time"
                          value={getSettingValue("business", "close_time")}
                          onChange={(e) => updateSetting("close_time", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thuế VAT (%)
                        </label>
                        <Input
                          type="number"
                          value={getSettingValue("business", "vat_rate")}
                          onChange={(e) => updateSetting("vat_rate", e.target.value)}
                          placeholder="10"
                        />
                      </div>
                    </div>
                  )}

                  {/* Notifications Settings */}
                  {activeTab === "notifications" && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Thông báo email</p>
                          <p className="text-sm text-gray-500">
                            Gửi thông báo qua email
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={getSettingValue("notifications", "email_enabled") === "true"}
                          onChange={(e) =>
                            updateSetting("email_enabled", e.target.checked.toString())
                          }
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Thông báo SMS</p>
                          <p className="text-sm text-gray-500">
                            Gửi thông báo qua SMS
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={getSettingValue("notifications", "sms_enabled") === "true"}
                          onChange={(e) =>
                            updateSetting("sms_enabled", e.target.checked.toString())
                          }
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Nhắc nhở lịch hẹn</p>
                          <p className="text-sm text-gray-500">
                            Tự động gửi nhắc nhở trước lịch hẹn
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={getSettingValue("notifications", "booking_reminder") === "true"}
                          onChange={(e) =>
                            updateSetting("booking_reminder", e.target.checked.toString())
                          }
                          className="rounded border-gray-300"
                        />
                      </div>
                    </div>
                  )}

                  {/* Security Settings */}
                  {activeTab === "security" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu tối thiểu
                        </label>
                        <Input
                          type="number"
                          value={getSettingValue("security", "min_password_length")}
                          onChange={(e) => updateSetting("min_password_length", e.target.value)}
                          placeholder="8"
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Yêu cầu mật khẩu mạnh</p>
                          <p className="text-sm text-gray-500">
                            Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={getSettingValue("security", "strong_password") === "true"}
                          onChange={(e) =>
                            updateSetting("strong_password", e.target.checked.toString())
                          }
                          className="rounded border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thời gian hết hạn session (phút)
                        </label>
                        <Input
                          type="number"
                          value={getSettingValue("security", "session_timeout")}
                          onChange={(e) => updateSetting("session_timeout", e.target.value)}
                          placeholder="30"
                        />
                      </div>
                    </div>
                  )}

                  {/* Integrations Settings */}
                  {activeTab === "integrations" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          API Key
                        </label>
                        <Input
                          type="password"
                          value={getSettingValue("integrations", "api_key")}
                          onChange={(e) => updateSetting("api_key", e.target.value)}
                          placeholder="Nhập API key"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Webhook URL
                        </label>
                        <Input
                          value={getSettingValue("integrations", "webhook_url")}
                          onChange={(e) => updateSetting("webhook_url", e.target.value)}
                          placeholder="https://example.com/webhook"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </MainLayout>
  );
}
