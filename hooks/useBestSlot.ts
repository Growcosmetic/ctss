import { addDuration, bookingsOverlap } from "@/utils/bookingUtils";

export interface Booking {
  id: string;
  stylistId: string;
  date: string;
  start: string;
  end: string;
  duration: number;
}

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTimeString(minutes: number) {
  const h = Math.floor(minutes / 60).toString().padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

function addMinutes(time: string, mins: number) {
  return toTimeString(toMinutes(time) + mins);
}

export function useBestSlot() {
  function getAvailableSlots(
    allBookings: Booking[],
    date: string,
    stylistId: string,
    duration: number
  ) {
    let slots: { start: string; end: string; note: string }[] = [];

    const DAY_START = "08:00";
    const DAY_END = "21:00";

    const list = allBookings
      .filter((b) => b.stylistId === stylistId && b.date === date)
      .sort((a, b) => a.start.localeCompare(b.start));

    if (list.length === 0) {
      const end = addMinutes(DAY_START, duration);
      if (end <= DAY_END) {
        slots.push({
          start: DAY_START,
          end,
          note: "Stylist trống cả ngày",
        });
      }
      return slots;
    }

    const first = list[0];
    const earlyEnd = addMinutes(DAY_START, duration);

    if (earlyEnd <= first.start) {
      slots.push({
        start: DAY_START,
        end: earlyEnd,
        note: "Trước lịch đầu",
      });
    }

    for (let i = 0; i < list.length - 1; i++) {
      const currentEnd = list[i].end;
      const nextStart = list[i + 1].start;
      const possibleEnd = addMinutes(currentEnd, duration);

      if (possibleEnd <= nextStart) {
        slots.push({
          start: currentEnd,
          end: possibleEnd,
          note: `Giữa ${list[i].start} – ${list[i + 1].start}`,
        });
      }
    }

    const last = list[list.length - 1];
    const endOfDaySlot = addMinutes(last.end, duration);

    if (endOfDaySlot <= DAY_END) {
      slots.push({
        start: last.end,
        end: endOfDaySlot,
        note: "Cuối ngày",
      });
    }

    return slots;
  }

  return { getAvailableSlots };
}
