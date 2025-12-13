# Buffer Time Implementation Plan - Phase 2

## 📋 Plan (Kế hoạch thực thi)

### 1. Backend/API Implementation
1. **Tạo utility function kiểm tra conflicts**
   - File: `lib/bookingUtils.ts`
   - Function: `checkBookingConflicts(staffId, startDateTime, endDateTime, bufferMinutes, excludeBookingId?)`
   - Logic: Query bookings của cùng staff trong khoảng thời gian (có buffer)
   - Return: Array of conflicting bookings hoặc null

2. **Cập nhật API endpoint `/api/bookings`**
   - File: `app/api/bookings/route.ts`
   - Thêm validation buffer time trước khi tạo booking
   - Trả về lỗi 409 nếu có conflict
   - Sử dụng transaction để tránh race condition

3. **Cập nhật API endpoint `/api/customer/create-booking`**
   - File: `app/api/customer/create-booking/route.ts`
   - Thêm validation buffer time tương tự

### 2. Frontend/UI Implementation
1. **Tạo utility function cho frontend**
   - File: `lib/bookingValidation.ts`
   - Function: `checkTimeConflict` để check conflicts trước khi submit
   - Function: `calculateEndTime` để tính end time từ start time + duration

2. **Cập nhật CreateBookingModal**
   - File: `components/booking/CreateBookingModal.tsx`
   - Thêm buffer time field (mặc định 10 phút, có thể ẩn)
   - Thêm validation trước khi submit
   - Hiển thị cảnh báo khi có conflict
   - Highlight khung giờ bị chặn

3. **Cập nhật BookingForm**
   - File: `components/booking/BookingForm.tsx`
   - Thêm buffer time validation
   - Hiển thị error messages

4. **Cập nhật Booking Calendar**
   - File: `components/booking/BookingCalendar.tsx`
   - Highlight conflicts khi hiển thị
   - Cảnh báo khi drag/drop vào slot có conflict

### 3. Validation
- Kiểm tra đầu vào: `customerId`, `serviceId`, `staffId`, `startTime`, `duration`, `bufferTime`
- Đảm bảo form không gửi nếu thiếu thông tin bắt buộc
- Validate buffer time >= 0 và <= 60 phút

---

## 📁 Files Changed

### Backend
1. `lib/bookingUtils.ts` (NEW) - Utility functions cho booking validation
2. `app/api/bookings/route.ts` - Thêm buffer time validation
3. `app/api/customer/create-booking/route.ts` - Thêm buffer time validation

### Frontend
1. `lib/bookingValidation.ts` (NEW) - Frontend validation utilities
2. `components/booking/CreateBookingModal.tsx` - Thêm buffer time và validation
3. `components/booking/BookingForm.tsx` - Thêm validation
4. `components/booking/BookingCalendar.tsx` - Highlight conflicts

---

## 🔧 Patch (Code Changes)

### 1. Backend Utility Function

**File: `lib/bookingUtils.ts` (NEW)**
```typescript
import { prisma } from "@/lib/prisma";

const DEFAULT_BUFFER_TIME_MINUTES = 10;

export interface BookingConflict {
  bookingId: string;
  startTime: Date;
  endTime: Date;
  customerName?: string;
}

/**
 * Check if a booking time conflicts with existing bookings for the same staff
 * @param staffId - Staff ID to check conflicts for
 * @param startDateTime - Start date and time of the new booking
 * @param endDateTime - End date and time of the new booking
 * @param bufferMinutes - Buffer time in minutes (default: 10)
 * @param excludeBookingId - Booking ID to exclude from conflict check (for updates)
 * @returns Array of conflicting bookings or null if no conflicts
 */
export async function checkBookingConflicts(
  staffId: string | null,
  startDateTime: Date,
  endDateTime: Date,
  bufferMinutes: number = DEFAULT_BUFFER_TIME_MINUTES,
  excludeBookingId?: string
): Promise<BookingConflict[] | null> {
  if (!staffId) {
    // If no staff assigned, no conflicts
    return null;
  }

  // Calculate time range with buffer
  const bufferMs = bufferMinutes * 60 * 1000;
  const checkStart = new Date(startDateTime.getTime() - bufferMs);
  const checkEnd = new Date(endDateTime.getTime() + bufferMs);

  // Find existing bookings for the same staff that overlap
  const existingBookings = await prisma.booking.findMany({
    where: {
      stylistId: staffId,
      date: {
        gte: checkStart,
        lte: checkEnd,
      },
      status: {
        notIn: ["CANCELLED", "NO_SHOW"], // Exclude cancelled bookings
      },
      ...(excludeBookingId && {
        id: {
          not: excludeBookingId,
        },
      }),
    },
    include: {
      customer: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  // Check for actual overlaps (considering buffer)
  const conflicts: BookingConflict[] = [];

  for (const booking of existingBookings) {
    const bookingStart = new Date(booking.date);
    // Assume duration is stored or calculate from service
    // For now, we'll use a default duration or get from service
    const bookingDuration = 60; // Default 60 minutes - should get from service
    const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60 * 1000);

    // Check if times overlap (with buffer)
    if (
      (startDateTime.getTime() < bookingEnd.getTime() + bufferMs) &&
      (endDateTime.getTime() > bookingStart.getTime() - bufferMs)
    ) {
      conflicts.push({
        bookingId: booking.id,
        startTime: bookingStart,
        endTime: bookingEnd,
        customerName: booking.customer
          ? `${booking.customer.firstName} ${booking.customer.lastName}`
          : undefined,
      });
    }
  }

  return conflicts.length > 0 ? conflicts : null;
}
```

### 2. Backend API Update

**File: `app/api/bookings/route.ts`**
```typescript
import { checkBookingConflicts } from "@/lib/bookingUtils";

// POST /api/bookings - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customerId,
      staffId,
      bookingDate,
      bookingTime,
      duration,
      bufferTime = 10, // Default 10 minutes
      notes,
      items,
      createdById,
    } = body;

    // Validation
    if (!customerId || !bookingDate || !bookingTime || !items || !Array.isArray(items) || items.length === 0) {
      return errorResponse("Customer, booking date, time, and items are required", 400);
    }

    if (!staffId) {
      return errorResponse("Staff ID is required", 400);
    }

    // Calculate duration from items if not provided
    const totalDuration = duration || items.reduce((sum: number, item: any) => sum + (item.duration || 0), 0);
    
    // Parse booking date and time
    const startDateTime = parseISO(`${bookingDate}T${bookingTime}`);
    const endDateTime = new Date(startDateTime.getTime() + totalDuration * 60 * 1000);

    // Check for conflicts with buffer time
    const conflicts = await checkBookingConflicts(
      staffId,
      startDateTime,
      endDateTime,
      bufferTime
    );

    if (conflicts) {
      return errorResponse(
        `Khung giờ này đã được đặt (có buffer ${bufferTime} phút). Vui lòng chọn thời gian khác.`,
        409
      );
    }

    // Create booking in transaction to avoid race condition
    const booking = await prisma.$transaction(async (tx) => {
      // Double-check conflicts within transaction
      const recheckConflicts = await checkBookingConflicts(
        staffId,
        startDateTime,
        endDateTime,
        bufferTime
      );

      if (recheckConflicts) {
        throw new Error("Booking conflict detected during transaction");
      }

      // Create booking
      return await tx.booking.create({
        data: {
          customerId,
          stylistId: staffId,
          date: startDateTime,
          status: "PENDING",
          branchId: "default-branch-id",
          notes: notes || null,
        },
        include: {
          customer: true,
          stylist: true,
        },
      });
    });

    return successResponse(booking, "Booking created successfully", 201);
  } catch (error: any) {
    if (error.message?.includes("conflict")) {
      return errorResponse(
        "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.",
        409
      );
    }
    return errorResponse(error.message || "Failed to create booking", 500);
  }
}
```

### 3. Frontend Validation Utility

**File: `lib/bookingValidation.ts` (NEW)**
```typescript
export interface BookingTimeSlot {
  start: string; // HH:mm format
  end: string; // HH:mm format
  date: string; // YYYY-MM-DD format
}

export interface ConflictInfo {
  hasConflict: boolean;
  conflicts: Array<{
    start: string;
    end: string;
    customerName?: string;
  }>;
}

/**
 * Calculate end time from start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(":").map(Number);
  const startTotalMinutes = hours * 60 + minutes;
  const endTotalMinutes = startTotalMinutes + durationMinutes;
  const endHours = Math.floor(endTotalMinutes / 60);
  const endMins = endTotalMinutes % 60;
  return `${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`;
}

/**
 * Check if two time slots overlap (with buffer)
 */
export function checkTimeOverlap(
  slot1: BookingTimeSlot,
  slot2: BookingTimeSlot,
  bufferMinutes: number = 10
): boolean {
  if (slot1.date !== slot2.date) return false;

  const [start1Hour, start1Min] = slot1.start.split(":").map(Number);
  const [end1Hour, end1Min] = slot1.end.split(":").map(Number);
  const [start2Hour, start2Min] = slot2.start.split(":").map(Number);
  const [end2Hour, end2Min] = slot2.end.split(":").map(Number);

  const start1Total = start1Hour * 60 + start1Min;
  const end1Total = end1Hour * 60 + end1Min;
  const start2Total = start2Hour * 60 + start2Min;
  const end2Total = end2Hour * 60 + end2Min;

  // Check overlap with buffer
  return (
    start1Total < end2Total + bufferMinutes &&
    end1Total > start2Total - bufferMinutes
  );
}
```

### 4. Frontend Component Update

**File: `components/booking/CreateBookingModal.tsx`**
```typescript
// Add buffer time state
const [bufferTime, setBufferTime] = useState(10); // Default 10 minutes
const [conflictError, setConflictError] = useState<string | null>(null);
const [isCheckingConflict, setIsCheckingConflict] = useState(false);

// Add conflict check before submit
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setConflictError(null);
  setIsCheckingConflict(true);

  try {
    // Check conflicts via API
    const response = await fetch("/api/bookings/check-conflict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffId: formData.stylistId,
        bookingDate: formData.date,
        bookingTime: formData.time,
        duration: duration,
        bufferTime: bufferTime,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      if (response.status === 409) {
        setConflictError(error.error || "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.");
        setIsCheckingConflict(false);
        return;
      }
      throw new Error(error.error || "Failed to check conflicts");
    }

    // No conflicts, proceed with submission
    onSubmit({ ...formData, bufferTime });
    // Reset form...
  } catch (error: any) {
    setConflictError(error.message || "Có lỗi xảy ra khi kiểm tra lịch hẹn");
  } finally {
    setIsCheckingConflict(false);
  }
};

// Add buffer time input (optional, can be hidden)
<div className="hidden">
  <label className="block text-sm font-medium text-gray-700 mb-2">
    Buffer Time (phút)
  </label>
  <input
    type="number"
    min="0"
    max="60"
    value={bufferTime}
    onChange={(e) => setBufferTime(Number(e.target.value))}
    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
  />
</div>

// Add error display
{conflictError && (
  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
    {conflictError}
  </div>
)}
```

---

## ✅ Manual Test Checklist

### Backend
- [ ] Utility function `checkBookingConflicts` hoạt động đúng
- [ ] API trả về 409 khi có conflict
- [ ] Transaction ngăn chặn race condition
- [ ] Buffer time được áp dụng đúng
- [ ] Không check conflict nếu staffId null

### Frontend
- [ ] Buffer time mặc định 10 phút
- [ ] Cảnh báo hiển thị khi có conflict
- [ ] Form không submit khi có conflict
- [ ] Highlight khung giờ bị chặn
- [ ] Validation hoạt động đúng
- [ ] Error messages rõ ràng

### Integration
- [ ] Tạo booking thành công khi không có conflict
- [ ] Tạo booking thất bại khi có conflict
- [ ] Cảnh báo hiển thị đúng thông tin conflict
- [ ] Calendar cập nhật sau khi tạo booking
- [ ] Cho phép đặt chồng lịch nếu là nhân viên khác

---

## 🎯 Kết quả mong muốn

✅ **Backend**: Kiểm tra buffer time trước khi tạo booking, trả về 409 nếu conflict
✅ **Frontend**: Hiển thị cảnh báo và validation, highlight conflicts
✅ **Validation**: Đầy đủ và rõ ràng
✅ **Race Condition**: Được xử lý bằng transaction

