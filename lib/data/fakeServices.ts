// Fake services data for Booking module

export interface Service {
  id: string;
  name: string;
  duration: number; // in minutes
  price: number;
}

export const fakeServices: Service[] = [
  { id: "service-1", name: "Cắt tóc nam", duration: 30, price: 100000 },
  { id: "service-2", name: "Cắt tóc nữ", duration: 45, price: 150000 },
  { id: "service-3", name: "Nhuộm tóc", duration: 120, price: 500000 },
  { id: "service-4", name: "Uốn tóc", duration: 180, price: 800000 },
  { id: "service-5", name: "Gội đầu", duration: 30, price: 80000 },
  { id: "service-6", name: "Massage đầu", duration: 20, price: 100000 },
  { id: "service-7", name: "Duỗi tóc", duration: 150, price: 600000 },
  { id: "service-8", name: "Phục hồi tóc", duration: 60, price: 200000 },
];

