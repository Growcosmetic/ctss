"use client";

import React from "react";
import { X } from "lucide-react";
import { fakeStylists } from "@/lib/data/fakeStylists";

interface StaffSelectorProps {
  stylists: Array<{ id: string; name: string }>;
  onSelect: (staffId: string) => void;
  onClose: () => void;
}

export default function StaffSelector({ stylists, onSelect, onClose }: StaffSelectorProps) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[400px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Chọn nhân viên</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Staff List */}
        <div className="flex-1 overflow-y-auto p-4">
          {stylists.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không có nhân viên</p>
          ) : (
            <div className="space-y-2">
              {stylists.map((stylist) => (
                <button
                  key={stylist.id}
                  onClick={() => {
                    onSelect(stylist.id);
                    onClose();
                  }}
                  className="w-full p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left"
                >
                  <p className="font-medium">{stylist.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

