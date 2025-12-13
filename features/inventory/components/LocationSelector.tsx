"use client";

import React, { useState, useEffect } from "react";
import { MapPin, Plus, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface Location {
  id: string;
  code: string;
  zone?: string | null;
  rack?: string | null;
  shelf?: string | null;
  bin?: string | null;
  description?: string | null;
  capacity?: number | null;
}

interface LocationSelectorProps {
  branchId: string;
  value?: string | null;
  onChange: (locationId: string | null) => void;
  disabled?: boolean;
}

export default function LocationSelector({
  branchId,
  value,
  onChange,
  disabled = false,
}: LocationSelectorProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  // Form state for creating new location
  const [formData, setFormData] = useState({
    code: "",
    zone: "",
    rack: "",
    shelf: "",
    bin: "",
    description: "",
    capacity: "",
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (branchId) {
      loadLocations();
    }
  }, [branchId]);

  useEffect(() => {
    if (value && locations.length > 0) {
      const location = locations.find((loc) => loc.id === value);
      setSelectedLocation(location || null);
    } else {
      setSelectedLocation(null);
    }
  }, [value, locations]);

  const loadLocations = async () => {
    if (!branchId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/inventory/locations?branchId=${branchId}`, {
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setLocations(result.data || []);
        }
      }
    } catch (error) {
      console.error("Error loading locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLocation = async () => {
    if (!formData.code.trim()) {
      alert("Vui lòng nhập mã vị trí");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/inventory/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          branchId,
          code: formData.code,
          zone: formData.zone || null,
          rack: formData.rack || null,
          shelf: formData.shelf || null,
          bin: formData.bin || null,
          description: formData.description || null,
          capacity: formData.capacity ? parseInt(formData.capacity) : null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        await loadLocations();
        // Auto-select the newly created location
        onChange(result.data.id);
        setIsCreateModalOpen(false);
        setFormData({
          code: "",
          zone: "",
          rack: "",
          shelf: "",
          bin: "",
          description: "",
          capacity: "",
        });
        alert("✅ Tạo vị trí thành công!");
      } else {
        alert(`❌ Lỗi: ${result.error || "Không thể tạo vị trí"}`);
      }
    } catch (error: any) {
      console.error("Error creating location:", error);
      alert(`❌ Lỗi: ${error.message || "Không thể tạo vị trí"}`);
    } finally {
      setCreating(false);
    }
  };

  const formatLocationDisplay = (location: Location): string => {
    const parts = [
      location.zone,
      location.rack,
      location.shelf,
      location.bin,
    ].filter(Boolean);

    if (parts.length > 0) {
      return `${location.code} (${parts.join(" - ")})`;
    }
    return location.code;
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Đang tải vị trí...</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        >
          <option value="">-- Chọn vị trí --</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {formatLocationDisplay(location)}
            </option>
          ))}
        </select>
        <Button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={disabled}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tạo mới
        </Button>
      </div>

      {selectedLocation && (
        <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <MapPin className="w-4 h-4" />
          <span>{formatLocationDisplay(selectedLocation)}</span>
          {selectedLocation.description && (
            <span className="text-gray-500">- {selectedLocation.description}</span>
          )}
        </div>
      )}

      {/* Create Location Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Tạo vị trí mới"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mã vị trí <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Ví dụ: A-01-02-03"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mã vị trí duy nhất trong chi nhánh (ví dụ: A-01-02-03)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khu vực (Zone)
              </label>
              <input
                type="text"
                value={formData.zone}
                onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                placeholder="Ví dụ: Khu A"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giá kệ (Rack)
              </label>
              <input
                type="text"
                value={formData.rack}
                onChange={(e) => setFormData({ ...formData, rack: e.target.value })}
                placeholder="Ví dụ: Rack 01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kệ (Shelf)
              </label>
              <input
                type="text"
                value={formData.shelf}
                onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                placeholder="Ví dụ: Shelf 02"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngăn (Bin)
              </label>
              <input
                type="text"
                value={formData.bin}
                onChange={(e) => setFormData({ ...formData, bin: e.target.value })}
                placeholder="Ví dụ: Bin 03"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả vị trí"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sức chứa (số sản phẩm)
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              placeholder="Tùy chọn"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={creating}
            >
              Hủy
            </Button>
            <Button
              onClick={handleCreateLocation}
              disabled={creating || !formData.code.trim()}
              className="flex items-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Tạo vị trí
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
