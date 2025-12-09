"use client";

import React, { useMemo, useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { CSS } from "@dnd-kit/utilities";
import BookingEvent from "./BookingEvent";
import BookingModal from "./BookingModal";
import { fakeServices } from "@/lib/data/fakeServices";
import { getDuration } from "@/lib/data/fakeBookings";
import { useBookingDrag } from "@/hooks/useBookingDrag";

// MODULE 12: Smart conflict checker
import { useBestSlot } from "@/hooks/useBestSlot";

// =======================================================
// TIME SLOTS
// =======================================================
const timeSlots: string[] = [];
for (let hour = 8; hour < 22; hour++) {
  for (let minute = 0; minute < 60; minute += 30) {
    timeSlots.push(`${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`);
  }
}

// =======================================================
// DRAGGABLE BOOKING
// =======================================================
function DraggableBooking({ booking, onClick, isDragging, onCheckIn, onCall, stylists }: any) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: booking.id,
    data: booking,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.7 : 1,
    pointerEvents: isDragging ? "none" : "auto",
    transition: isDragging ? "none" : "opacity .2s, transform .2s",
  };

  return (
    <div ref={setNodeRef} {...listeners} {...attributes} style={style} className="cursor-move">
      <BookingEvent 
        booking={booking} 
        onClick={onClick}
        onCheckIn={onCheckIn}
        onCall={onCall}
        stylists={stylists}
      />
    </div>
  );
}

// =======================================================
// DROPPABLE SLOT
// =======================================================
function DroppableSlot({ id, rowIndex, stylistId, date }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { rowIndex, stylistId, date },
  });

  return (
    <div
      ref={setNodeRef}
      className="border-b border-gray-100"
      style={{
        height: "60px",
        pointerEvents: "auto",
        backgroundColor: isOver ? "rgba(164,227,227,.3)" : "transparent",
      }}
    />
  );
}

// =======================================================
// MAIN COMPONENT
// =======================================================
interface BookingCalendarProps {
  bookingList: any[];
  setBookingList: (list: any[] | ((prev: any[]) => any[])) => void;
  stylists: Array<{ id: string; name: string }>;
  selectedDate: Date;
  onBookingClick?: (booking: any) => void;
  selectedStylists?: string[];
  selectedService?: string;
  selectedStatus?: string;
  onCheckIn?: (id: string) => void;
  onCall?: (phone: string) => void;
  viewMode?: "staff" | "time";
}

export default function BookingCalendar({
  bookingList,
  setBookingList,
  stylists,
  selectedDate,
  onBookingClick,
  selectedStylists = [],
  selectedService = "all",
  selectedStatus = "all",
  onCheckIn,
  onCall,
  viewMode = "time",
}: BookingCalendarProps) {
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { getAvailableSlots } = useBestSlot();

  // WEEK DAYS
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // NORMALIZE BOOKINGS
  const calendarBookings = useMemo(() => {
    return bookingList.map((b: any) => {
      const service = fakeServices.find((s: any) => s.name === b.serviceName);
      const duration = b.start && b.end
        ? getDuration(b.start, b.end)
        : service?.duration || 30;

      return { ...b, duration, time: b.start, status: b.status.toUpperCase() };
    });
  }, [bookingList]);

  // MODULE 8: FILTER BOOKINGS
  const filteredBookings = useMemo(() => {
    return calendarBookings.filter((b: any) => {
      // Filter by stylists
      if (selectedStylists.length > 0 && !selectedStylists.includes(b.stylistId)) {
        return false;
      }

      // Filter by service
      if (selectedService !== "all") {
        const service = fakeServices.find((s: any) => s.id === selectedService);
        if (service && b.serviceName !== service.name) {
          return false;
        }
      }

      // Filter by status
      if (selectedStatus !== "all" && b.status !== selectedStatus.toUpperCase()) {
        return false;
      }

      return true;
    });
  }, [calendarBookings, selectedStylists, selectedService, selectedStatus]);

  // HANDLE APPLY
  const handleBookingDrop = (updated: any) => {
    const duration = updated.duration;

    const conflicts = calendarBookings.filter((b: any) => {
      if (b.id === updated.id) return false;
      if (b.stylistId !== updated.stylistId) return false;
      if (b.date !== updated.date) return false;

      const bStart = b.start;
      const bEnd = b.end;

      return (
        (updated.start < bEnd && updated.end > bStart)
      );
    });

    // If conflict → Smart Suggest Best Slot
    if (conflicts.length > 0) {
      const suggestions = getAvailableSlots(
        calendarBookings,
        updated.date,
        updated.stylistId,
        duration
      );

      if (suggestions.length > 0) {
        const best = suggestions[0];
        updated.start = best.start;
        updated.end = best.end;
      }
    }

    setBookingList((prev: any[]) =>
      prev.map((b: any) => (b.id === updated.id ? { ...b, ...updated } : b))
    );
  };

  const { activeBooking, isDragging, handleDragStart, handleDragEnd } =
    useBookingDrag({
      bookings: filteredBookings,
      onBookingDrop: handleBookingDrop,
    });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const getTimePosition = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return ((h - 8) * 60 + m) * 2;
  };

  // =======================================================
  // RENDER
  // =======================================================
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="overflow-x-auto">

          {/* HEADER */}
          <div className="flex border-b sticky top-0 bg-white z-10">
            {/* Time column header */}
            <div className="w-24 border-r"></div>

            {/* Day headers - không hiển thị nhân viên dưới ngày */}
            {weekDays.map((day) => (
              <div key={day.toISOString()} className="flex-1 border-r">
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">{format(day, "EEE")}</p>
                  <p className="text-lg font-semibold">{format(day, "dd")}</p>
                </div>
              </div>
            ))}
          </div>

          {/* BODY */}
          <div className="flex">
            {/* TIME COLUMN + STAFF COLUMN (nếu viewMode = "staff") */}
            {viewMode === "staff" ? (
              <>
                {/* Staff names column - bên trái */}
                <div className="w-32 border-r bg-gray-50">
                  {/* Empty space for header */}
                  <div className="h-[72px] border-b"></div>
                  {/* Staff names */}
                  {stylists.map((st: any) => {
                    const rowHeight = timeSlots.length * 60;
                    return (
                      <div
                        key={st.id}
                        className="border-b flex items-center justify-center p-2"
                        style={{ height: `${rowHeight}px` }}
                      >
                        <span className="text-sm font-medium text-gray-900 text-center">
                          {st.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
                {/* Time column */}
                <div className="w-24 border-r">
                  {timeSlots.map((t, i) => (
                    <div key={t} className="h-[60px] border-b flex justify-end pr-2 pt-1">
                      {i % 2 === 0 && <span className="text-xs text-gray-400">{t}</span>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* TIME COLUMN - chỉ khi viewMode = "time" */
              <div className="w-24 border-r">
                {timeSlots.map((t, i) => (
                  <div key={t} className="h-[60px] border-b flex justify-end pr-2 pt-1">
                    {i % 2 === 0 && <span className="text-xs text-gray-400">{t}</span>}
                  </div>
                ))}
              </div>
            )}

            {/* DAYS GRID */}
            {weekDays.map((day) => {
              const dayStr = format(day, "yyyy-MM-dd");

              if (viewMode === "staff") {
                // Chế độ "Nhân viên": Mỗi nhân viên một hàng
                return (
                  <div key={dayStr} className="flex-1 border-r relative">
                    {stylists.map((st: any, staffIndex: number) => {
                      const rowHeight = timeSlots.length * 60;
                      return (
                        <div
                          key={st.id}
                          className="relative border-t"
                          style={{ height: `${rowHeight}px` }}
                        >
                          {/* Tạo slots cho nhân viên này */}
                          {timeSlots.map((__, rowIndex) => {
                            const id = `slot|${dayStr}|${st.id}|${rowIndex}`;
                            return (
                              <DroppableSlot
                                key={id}
                                id={id}
                                rowIndex={rowIndex}
                                stylistId={st.id}
                                date={dayStr}
                              />
                            );
                          })}

                          {/* BOOKINGS cho nhân viên này */}
                          <div className="absolute inset-0 pointer-events-none">
                            {filteredBookings
                              .filter((b: any) => b.date === dayStr && b.stylistId === st.id)
                              .map((b: any) => {
                                const position = getTimePosition(b.start);
                                const k = `${b.id}-${b.start}-${b.end}`;

                                return (
                                  <div
                                    key={k}
                                    className="absolute left-0 right-0 pointer-events-none"
                                    style={{ top: position }}
                                  >
                                    <div className="pointer-events-auto">
                                      <DraggableBooking
                                        booking={b}
                                        onClick={() => {
                                          setSelectedBooking(b);
                                          if (onBookingClick) onBookingClick(b);
                                        }}
                                        isDragging={isDragging && (activeBooking as any)?.id === b.id}
                                        onCheckIn={onCheckIn || ((id: string) => {
                                          setBookingList((prev: any[]) =>
                                            prev.map((booking: any) =>
                                              booking.id === id
                                                ? { ...booking, status: "IN_PROGRESS" }
                                                : booking
                                            )
                                          );
                                        })}
                                        onCall={onCall || ((phone: string) => {
                                          window.location.href = `tel:${phone}`;
                                        })}
                                        stylists={stylists}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                // Chế độ "Thời gian": Không chia theo nhân viên
                return (
                  <div key={dayStr} className="flex-1 border-r relative">
                    <div className="relative">
                      {/* Tạo slots cho tất cả stylists - invisible nhưng vẫn có thể drop */}
                      {stylists.map((st: any) => (
                        <div key={st.id} className="relative">
                          {timeSlots.map((__, rowIndex) => {
                            const id = `slot|${dayStr}|${st.id}|${rowIndex}`;
                            return (
                              <DroppableSlot
                                key={id}
                                id={id}
                                rowIndex={rowIndex}
                                stylistId={st.id}
                                date={dayStr}
                              />
                            );
                          })}
                        </div>
                      ))}

                      {/* BOOKINGS - Hiển thị tất cả bookings trong ngày, không chia theo stylist */}
                      <div className="absolute inset-0 pointer-events-none">
                        {filteredBookings
                          .filter((b: any) => b.date === dayStr)
                          .map((b: any) => {
                            const position = getTimePosition(b.start);
                            const k = `${b.id}-${b.start}-${b.end}`;

                            return (
                              <div
                                key={k}
                                className="absolute left-0 right-0 pointer-events-none"
                                style={{ top: position }}
                              >
                                <div className="pointer-events-auto">
                                  <DraggableBooking
                                    booking={b}
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      if (onBookingClick) onBookingClick(b);
                                    }}
                                    isDragging={isDragging && (activeBooking as any)?.id === b.id}
                                    onCheckIn={onCheckIn || ((id: string) => {
                                      setBookingList((prev: any[]) =>
                                        prev.map((booking: any) =>
                                          booking.id === id
                                            ? { ...booking, status: "IN_PROGRESS" }
                                            : booking
                                        )
                                      );
                                    })}
                                    onCall={onCall || ((phone: string) => {
                                      window.location.href = `tel:${phone}`;
                                    })}
                                    stylists={stylists}
                                  />
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeBooking && <BookingEvent booking={activeBooking} />}
      </DragOverlay>

      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          stylists={stylists}
          bookingList={bookingList}
          onClose={() => setSelectedBooking(null)}
          onSave={(updated: any) => {
            setBookingList((prev: any[]) =>
              prev.map((b: any) => (b.id === updated.id ? { ...b, ...updated } : b))
            );
            setSelectedBooking(null);
          }}
          onDelete={(id: any) => {
            setBookingList((prev: any[]) => prev.filter((b: any) => b.id !== id));
            setSelectedBooking(null);
          }}
        />
      )}
    </DndContext>
  );
}
