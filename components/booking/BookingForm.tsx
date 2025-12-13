"use client";

import React, { useState, useEffect } from "react";
import Modal from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Calendar } from "@/components/ui/Calendar";
import { format } from "date-fns";
import { X, Plus } from "lucide-react";

interface Service {
  id: string;
  name: string;
  duration: number;
  servicePrices: Array<{
    price: number;
  }>;
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface Staff {
  id: string;
  employeeId: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  initialData?: Partial<BookingFormData>;
  customers: Customer[];
  staff: Staff[];
  services: Service[];
}

export interface BookingFormData {
  customerId: string;
  staffId?: string;
  bookingDate: Date;
  bookingTime: string;
  items: Array<{
    serviceId: string;
    price: number;
    duration: number;
  }>;
  notes?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  customers,
  staff,
  services,
}) => {
  const [formData, setFormData] = useState<BookingFormData>({
    customerId: initialData?.customerId || "",
    staffId: initialData?.staffId,
    bookingDate: initialData?.bookingDate || new Date(),
    bookingTime: initialData?.bookingTime || "09:00",
    items: initialData?.items || [],
    notes: initialData?.notes || "",
  });

  const [selectedService, setSelectedService] = useState<string>("");
  const [searchCustomer, setSearchCustomer] = useState("");
  const [searchStaff, setSearchStaff] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCustomers = customers.filter(
    (c) =>
      c.firstName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.lastName.toLowerCase().includes(searchCustomer.toLowerCase()) ||
      c.phone.includes(searchCustomer)
  );

  const filteredStaff = staff.filter(
    (s) =>
      s.user.firstName.toLowerCase().includes(searchStaff.toLowerCase()) ||
      s.user.lastName.toLowerCase().includes(searchStaff.toLowerCase()) ||
      s.employeeId.toLowerCase().includes(searchStaff.toLowerCase())
  );

  const handleAddService = () => {
    if (!selectedService) return;

    const service = services.find((s) => s.id === selectedService);
    if (!service) return;

    const price = service.servicePrices[0]?.price || 0;
    const duration = service.duration || 60;

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          serviceId: service.id,
          price,
          duration,
        },
      ],
    });

    setSelectedService("");
  };

  const handleRemoveService = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || formData.items.length === 0) {
      alert("Vui lòng chọn khách hàng và ít nhất một dịch vụ");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to submit booking:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = formData.items.reduce((sum, item) => sum + item.price, 0);
  const totalDuration = formData.items.reduce((sum, item) => sum + item.duration, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đặt lịch mới"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} isLoading={isSubmitting}>
            Đặt lịch
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Khách hàng *
          </label>
          <Input
            placeholder="Tìm kiếm khách hàng..."
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
          />
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredCustomers.map((customer) => (
              <button
                key={customer.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, customerId: customer.id });
                  setSearchCustomer("");
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  formData.customerId === customer.id ? "bg-primary-50" : ""
                }`}
              >
                <p className="font-medium">
                  {customer.firstName} {customer.lastName}
                </p>
                <p className="text-sm text-gray-500">{customer.phone}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Staff Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nhân viên (tùy chọn)
          </label>
          <Input
            placeholder="Tìm kiếm nhân viên..."
            value={searchStaff}
            onChange={(e) => setSearchStaff(e.target.value)}
          />
          <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setFormData({ ...formData, staffId: undefined });
                setSearchStaff("");
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                !formData.staffId ? "bg-primary-50" : ""
              }`}
            >
              Không chỉ định
            </button>
            {filteredStaff.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setFormData({ ...formData, staffId: s.id });
                  setSearchStaff("");
                }}
                className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                  formData.staffId === s.id ? "bg-primary-50" : ""
                }`}
              >
                <p className="font-medium">
                  {s.user.firstName} {s.user.lastName}
                </p>
                <p className="text-sm text-gray-500">{s.employeeId}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày đặt lịch *
            </label>
            <Calendar
              selectedDate={formData.bookingDate}
              onDateSelect={(date) =>
                setFormData({ ...formData, bookingDate: date })
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Giờ đặt lịch *
            </label>
            <Input
              type="time"
              value={formData.bookingTime}
              onChange={(e) =>
                setFormData({ ...formData, bookingTime: e.target.value })
              }
            />
          </div>
        </div>

        {/* Services */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dịch vụ *
          </label>
          <div className="flex gap-2">
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Chọn dịch vụ...</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - {service.duration} phút
                </option>
              ))}
            </select>
            <Button type="button" onClick={handleAddService} variant="outline">
              <Plus size={18} />
            </Button>
          </div>

          {/* Selected Services */}
          <div className="mt-2 space-y-2">
            {formData.items.map((item, index) => {
              const service = services.find((s) => s.id === item.serviceId);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{service?.name}</p>
                    <p className="text-sm text-gray-500">
                      {item.duration} phút • {formatCurrency(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Tổng thời gian:</span>
            <span className="font-medium">{totalDuration} phút</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tổng tiền:</span>
            <span className="text-lg font-bold text-primary-600">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ghi chú
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Ghi chú về lịch hẹn..."
          />
        </div>
      </form>
    </Modal>
  );
};

