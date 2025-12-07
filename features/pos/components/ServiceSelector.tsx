"use client";

import React, { useState } from "react";
import { X, Search } from "lucide-react";
import { fakeServices } from "@/lib/data/fakeServices";

interface ServiceSelectorProps {
  onSelect: (service: { id: string; name: string; price: number }) => void;
  onClose: () => void;
}

export default function ServiceSelector({ onSelect, onClose }: ServiceSelectorProps) {
  const [search, setSearch] = useState("");

  const filteredServices = fakeServices.filter((service) =>
    service.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[500px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-semibold">Chọn dịch vụ</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm dịch vụ..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Services List */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredServices.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Không tìm thấy dịch vụ</p>
          ) : (
            <div className="space-y-2">
              {filteredServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    onSelect({
                      id: service.id,
                      name: service.name,
                      price: service.price,
                    });
                    onClose();
                  }}
                  className="w-full p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition text-left"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-gray-500">
                        {service.duration} phút
                      </p>
                    </div>
                    <p className="font-semibold text-blue-600">
                      {service.price.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

