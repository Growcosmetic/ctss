// Fake bookings data for Booking module
import { startOfWeek, addDays, format } from "date-fns";

export interface Booking {
  id: string;
  customerName: string;
  serviceName: string;
  stylistId: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:mm
  end: string; // HH:mm
  status: "confirmed" | "pending" | "cancelled";
  phone?: string;
  notes?: string;
}

// Get current week (Monday to Sunday)
const today = new Date();
const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday

// Generate bookings for this week
export const fakeBookings: Booking[] = [
  // Monday bookings
  {
    id: "booking-1",
    customerName: "Nguyễn Thị Mai",
    serviceName: "Cắt tóc nữ",
    stylistId: "stylist-1", // Tâm
    date: format(weekStart, "yyyy-MM-dd"),
    start: "09:00",
    end: "09:45",
    status: "confirmed",
    phone: "0901234567",
    notes: "Khách hàng muốn cắt ngắn",
  },
  {
    id: "booking-2",
    customerName: "Trần Văn Nam",
    serviceName: "Cắt tóc nam",
    stylistId: "stylist-2", // Ngọc
    date: format(weekStart, "yyyy-MM-dd"),
    start: "10:30",
    end: "11:00",
    status: "pending",
    phone: "0912345678",
  },
  {
    id: "booking-3",
    customerName: "Lê Thị Lan",
    serviceName: "Nhuộm tóc",
    stylistId: "stylist-3", // Minh
    date: format(weekStart, "yyyy-MM-dd"),
    start: "14:00",
    end: "16:00",
    status: "confirmed",
    phone: "0923456789",
    notes: "Nhuộm màu nâu đỏ",
  },

  // Tuesday bookings
  {
    id: "booking-4",
    customerName: "Phạm Văn Hùng",
    serviceName: "Gội đầu",
    stylistId: "stylist-4", // Vy
    date: format(addDays(weekStart, 1), "yyyy-MM-dd"),
    start: "11:00",
    end: "11:30",
    status: "confirmed",
    phone: "0934567890",
  },
  {
    id: "booking-5",
    customerName: "Hoàng Thị Hoa",
    serviceName: "Uốn tóc",
    stylistId: "stylist-1", // Tâm
    date: format(addDays(weekStart, 1), "yyyy-MM-dd"),
    start: "15:00",
    end: "18:00",
    status: "pending",
    phone: "0945678901",
    notes: "Uốn sóng tự nhiên",
  },

  // Wednesday bookings
  {
    id: "booking-6",
    customerName: "Võ Văn Đức",
    serviceName: "Cắt tóc nam",
    stylistId: "stylist-2", // Ngọc
    date: format(addDays(weekStart, 2), "yyyy-MM-dd"),
    start: "09:30",
    end: "10:00",
    status: "confirmed",
    phone: "0956789012",
  },
  {
    id: "booking-7",
    customerName: "Bùi Thị Nga",
    serviceName: "Duỗi tóc",
    stylistId: "stylist-3", // Minh
    date: format(addDays(weekStart, 2), "yyyy-MM-dd"),
    start: "13:30",
    end: "16:00",
    status: "cancelled",
    phone: "0967890123",
    notes: "Khách hủy do có việc đột xuất",
  },

  // Thursday bookings
  {
    id: "booking-8",
    customerName: "Đỗ Văn Tuấn",
    serviceName: "Massage đầu",
    stylistId: "stylist-4", // Vy
    date: format(addDays(weekStart, 3), "yyyy-MM-dd"),
    start: "10:00",
    end: "10:20",
    status: "confirmed",
    phone: "0978901234",
  },
];

// Helper function to calculate duration in minutes from start and end time
export const getDuration = (start: string, end: string): number => {
  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  return endTotalMinutes - startTotalMinutes;
};

// Helper function to convert booking format for BookingCalendar
export const convertBookingForCalendar = (booking: Booking) => {
  return {
    id: booking.id,
    customerName: booking.customerName,
    serviceName: booking.serviceName,
    stylistId: booking.stylistId,
    date: booking.date,
    time: booking.start,
    duration: getDuration(booking.start, booking.end),
    status: booking.status.toUpperCase() as "CONFIRMED" | "PENDING" | "CANCELLED",
    phone: booking.phone,
    notes: booking.notes,
  };
};

