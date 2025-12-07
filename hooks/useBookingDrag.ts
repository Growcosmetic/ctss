"use client";

import { useState } from "react";
import { DragStartEvent, DragEndEvent, DragOverEvent } from "@dnd-kit/core";
import { addDuration, bookingsOverlap, isValidEndTime, isValidTime } from "@/utils/bookingUtils";

export function useBookingDrag({ bookings, onBookingDrop }: any) {
  const [activeBooking, setActiveBooking] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [overlappingSlot, setOverlappingSlot] = useState<string | null>(null);

  // ==============================
  // REAL-TIME CONFLICT CHECK
  // ==============================
  const detectOverlapDuringDrag = (booking: any, target: any) => {
    if (!target) return false;

    const rowIndex = target.rowIndex;
    const stylistId = target.stylistId;
    const date = target.date;

    const newStart = rowIndexToTime(rowIndex);
    const newEnd = addDuration(newStart, booking.duration);

    // validate range
    if (!isValidTime(newStart)) return true;
    if (!isValidEndTime(newEnd)) return true;

    return bookings.some((b: any) => {
      if (b.id === booking.id) return false;
      if (b.date !== date) return false;
      if (b.stylistId !== stylistId) return false;

      const bStart = b.start || b.time;
      const bEnd = b.end || addDuration(bStart, b.duration);

      return bookingsOverlap(
        { start: newStart, end: newEnd },
        { start: bStart, end: bEnd }
      );
    });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const booking = bookings.find((b: any) => b.id === event.active.id);

    if (booking) {
      setActiveBooking(booking);
      setIsDragging(true);
      setOverlappingSlot(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!activeBooking) return;
    const dropData = event.over?.data?.current;

    if (!dropData) return;

    const overlap = detectOverlapDuringDrag(activeBooking, dropData);

    if (overlap) {
      setOverlappingSlot(event.over?.id || null);
    } else {
      setOverlappingSlot(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setIsDragging(false);

    if (!over) return;
    if (!activeBooking) return;

    const dropData = over.data?.current;
    if (!dropData) return;

    // ❌ STOP DROP IF OVERLAP
    if (overlappingSlot === over.id) {
      console.log("❌ Cannot drop: conflict");
      setOverlappingSlot(null);
      return;
    }

    const rowIndex = dropData.rowIndex;
    const stylistId = dropData.stylistId;
    const date = dropData.date;

    const newStart = rowIndexToTime(rowIndex);
    const newEnd = addDuration(newStart, activeBooking.duration);

    onBookingDrop({
      ...activeBooking,
      stylistId,
      date,
      start: newStart,
      end: newEnd,
      time: newStart,
    });

    setOverlappingSlot(null);
  };

  return {
    activeBooking,
    isDragging,
    overlappingSlot,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
  };
}

// convert index → time
function rowIndexToTime(rowIndex: number) {
  const hour = 8 + Math.floor(rowIndex / 2);
  const min = rowIndex % 2 === 0 ? "00" : "30";
  return `${String(hour).padStart(2, "0")}:${min}`;
}
