// Fake stylists data for Booking module

export interface Stylist {
  id: string;
  name: string;
  role?: string;
  group?: string;
}

export const fakeStylists: Stylist[] = [
  { id: "stylist-1", name: "Tâm", role: "STYLIST", group: "Stylist" },
  { id: "stylist-2", name: "Ngọc", role: "STYLIST", group: "Stylist" },
  { id: "stylist-3", name: "Minh", role: "STYLIST", group: "Stylist" },
  { id: "stylist-4", name: "Vy", role: "ASSISTANT", group: "THỢ PHỤ NHÓM B-STAFF B" },
];

