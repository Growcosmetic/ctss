"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function TrainingLibraryPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [grouped, setGrouped] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  useEffect(() => {
    loadLibrary();
  }, [selectedCategory, selectedRole]);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedRole) params.append("role", selectedRole);

      const res = await fetch(`/api/training/library/list?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setModules(data.modules || []);
        setGrouped(data.grouped || {});
      }
    } catch (err) {
      console.error("Load library error:", err);
    } finally {
      setLoading(false);
    }
  };

  const initLibrary = async () => {
    if (
      !confirm(
        "Bạn có chắc muốn khởi tạo thư viện module? Điều này sẽ tạo 52 modules."
      )
    )
      return;

    try {
      const res = await fetch("/api/training/library/init", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(
          `Đã tạo thành công ${data.modules} modules! Tổng cộng 52 modules.`
        );
        loadLibrary();
      }
    } catch (err) {
      console.error("Init library error:", err);
      alert("Có lỗi xảy ra");
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">⏳ Đang tải...</div>
      </div>
    );
  }

  const categories = [
    { id: "product", name: "Kiến thức sản phẩm", count: 12, color: "blue" },
    {
      id: "technical",
      name: "Kỹ thuật chuyên môn",
      count: 16,
      color: "green",
    },
    {
      id: "communication",
      name: "Giao tiếp & Tư vấn",
      count: 10,
      color: "purple",
    },
    { id: "sop", name: "SOP từng bộ phận", count: 8, color: "orange" },
    { id: "culture", name: "Văn hóa - Tư duy", count: 6, color: "pink" },
  ];

  const roles = [
    { id: "ALL", name: "Tất cả" },
    { id: "RECEPTIONIST", name: "Lễ tân" },
    { id: "STYLIST", name: "Stylist" },
    { id: "ASSISTANT", name: "Pha chế" },
    { id: "CSKH_ONLINE", name: "CSKH Online" },
  ];

  const categoryNames: Record<string, string> = {
    product: "Kiến thức sản phẩm",
    technical: "Kỹ thuật chuyên môn",
    communication: "Giao tiếp & Tư vấn",
    sop: "SOP từng bộ phận",
    culture: "Văn hóa - Tư duy",
  };

  const roleNames: Record<string, string> = {
    ALL: "Tất cả",
    RECEPTIONIST: "Lễ tân",
    STYLIST: "Stylist",
    ASSISTANT: "Pha chế",
    CSKH_ONLINE: "CSKH Online",
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">📚 Training Modules Library</h1>
          <p className="text-gray-600">
            Thư viện 52 modules đào tạo nội bộ cho toàn salon
          </p>
        </div>
        {modules.length === 0 && (
          <Button onClick={initLibrary} className="bg-blue-600">
            📋 Khởi tạo Thư viện (52 Modules)
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {categories.map((cat) => (
          <Card
            key={cat.id}
            className={`p-4 border rounded-xl ${
              cat.id === selectedCategory
                ? "bg-blue-50 border-blue-300"
                : "bg-white"
            }`}
          >
            <div className="text-sm text-gray-600 mb-1">{cat.name}</div>
            <div className="text-2xl font-bold">
              {grouped[cat.id]?.length || 0} / {cat.count}
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4 border">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="text-sm font-medium">Lọc theo:</div>
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedCategory === ""
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Tất cả Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedCategory === cat.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 flex-wrap mt-3">
          <div className="text-sm font-medium">Role:</div>
          <button
            onClick={() => setSelectedRole("")}
            className={`px-4 py-2 rounded-lg text-sm ${
              selectedRole === ""
                ? "bg-purple-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Tất cả
          </button>
          {roles.slice(1).map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`px-4 py-2 rounded-lg text-sm ${
                selectedRole === role.id
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {role.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Modules List */}
      {modules.length === 0 ? (
        <Card className="p-8 border text-center">
          <div className="text-gray-500 mb-4">
            Chưa có modules nào. Click "Khởi tạo Thư viện" để tạo 52 modules.
          </div>
          <Button onClick={initLibrary}>📋 Khởi tạo Thư viện</Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Grouped by Category */}
          {Object.entries(grouped).map(([category, categoryModules]: [string, any]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">
                📁 {categoryNames[category] || category} ({categoryModules.length}
                modules)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryModules.map((module: any) => (
                  <Card
                    key={module.id}
                    className="p-4 border rounded-xl hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">
                          {module.title}
                        </h3>
                        {module.desc && (
                          <p className="text-sm text-gray-600 mb-2">
                            {module.desc}
                          </p>
                        )}
                      </div>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        #{module.order}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {roleNames[module.role] || module.role || "ALL"}
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                        {module._count?.lessons || 0} Lessons
                      </span>
                    </div>
                    {module.lessons && module.lessons.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-600 mb-2">
                          Lessons:
                        </div>
                        <ul className="space-y-1">
                          {module.lessons.slice(0, 3).map((lesson: any) => (
                            <li key={lesson.id} className="text-xs text-gray-700">
                              • {lesson.title}
                            </li>
                          ))}
                          {module.lessons.length > 3 && (
                            <li className="text-xs text-gray-500">
                              + {module.lessons.length - 3} lessons khác
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    <Link
                      href={`/training/module/${module.id}`}
                      className="mt-3 block text-center text-sm text-blue-600 hover:underline"
                    >
                      Xem chi tiết →
                    </Link>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

