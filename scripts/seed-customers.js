const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const customers = [
  {
    name: "Nguyễn Văn An",
    phone: "0901234567",
    email: "nguyenvanan@example.com",
    birthday: new Date("1990-05-15"),
    gender: "MALE",
    address: "123 Đường Nguyễn Huệ, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP",
    totalSpent: 5000000,
    totalVisits: 10,
    loyaltyPoints: 500,
    status: "ACTIVE",
  },
  {
    name: "Trần Thị Bình",
    phone: "0902345678",
    email: "tranthibinh@example.com",
    birthday: new Date("1992-08-20"),
    gender: "FEMALE",
    address: "456 Đường Lê Lợi, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết",
    totalSpent: 3000000,
    totalVisits: 8,
    loyaltyPoints: 300,
    status: "ACTIVE",
  },
  {
    name: "Lê Văn Cường",
    phone: "0903456789",
    email: "levancuong@example.com",
    birthday: new Date("1988-12-10"),
    gender: "MALE",
    address: "789 Đường Pasteur, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng mới",
    totalSpent: 1000000,
    totalVisits: 3,
    loyaltyPoints: 100,
    status: "ACTIVE",
  },
  {
    name: "Phạm Thị Dung",
    phone: "0904567890",
    email: "phamthidung@example.com",
    birthday: new Date("1995-03-25"),
    gender: "FEMALE",
    address: "321 Đường Điện Biên Phủ, Quận Bình Thạnh",
    city: "Quận Bình Thạnh",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thường xuyên",
    totalSpent: 8000000,
    totalVisits: 15,
    loyaltyPoints: 800,
    status: "ACTIVE",
  },
  {
    name: "Hoàng Văn Em",
    phone: "0905678901",
    email: "hoangvanem@example.com",
    birthday: new Date("1991-07-18"),
    gender: "MALE",
    address: "654 Đường Võ Văn Tần, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP",
    totalSpent: 12000000,
    totalVisits: 20,
    loyaltyPoints: 1200,
    status: "ACTIVE",
  },
  {
    name: "Võ Thị Phương",
    phone: "0906789012",
    email: "vothiphuong@example.com",
    birthday: new Date("1993-11-05"),
    gender: "FEMALE",
    address: "987 Đường Nguyễn Đình Chiểu, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết",
    totalSpent: 6000000,
    totalVisits: 12,
    loyaltyPoints: 600,
    status: "ACTIVE",
  },
  {
    name: "Đặng Văn Giang",
    phone: "0907890123",
    email: "dangvangiang@example.com",
    birthday: new Date("1989-09-30"),
    gender: "MALE",
    address: "147 Đường Nam Kỳ Khởi Nghĩa, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng mới",
    totalSpent: 500000,
    totalVisits: 1,
    loyaltyPoints: 50,
    status: "ACTIVE",
  },
  {
    name: "Bùi Thị Hoa",
    phone: "0908901234",
    email: "buithihoa@example.com",
    birthday: new Date("1994-04-12"),
    gender: "FEMALE",
    address: "258 Đường Cách Mạng Tháng 8, Quận 10",
    city: "Quận 10",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thường xuyên",
    totalSpent: 4000000,
    totalVisits: 9,
    loyaltyPoints: 400,
    status: "ACTIVE",
  },
  {
    name: "Ngô Văn Ích",
    phone: "0909012345",
    email: "ngovanich@example.com",
    birthday: new Date("1990-01-22"),
    gender: "MALE",
    address: "369 Đường Lý Tự Trọng, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP",
    totalSpent: 15000000,
    totalVisits: 25,
    loyaltyPoints: 1500,
    status: "ACTIVE",
  },
  {
    name: "Đỗ Thị Kim",
    phone: "0900123456",
    email: "dothikim@example.com",
    birthday: new Date("1992-06-08"),
    gender: "FEMALE",
    address: "741 Đường Trần Hưng Đạo, Quận 5",
    city: "Quận 5",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết",
    totalSpent: 7000000,
    totalVisits: 14,
    loyaltyPoints: 700,
    status: "ACTIVE",
  },
];

async function seedCustomers() {
  try {
    console.log("🌱 Bắt đầu tạo 10 khách hàng mẫu...");

    for (const customerData of customers) {
      // Kiểm tra xem khách hàng đã tồn tại chưa
      const existing = await prisma.customer.findUnique({
        where: { phone: customerData.phone },
      });

      if (existing) {
        console.log(`⏭️  Khách hàng đã tồn tại: ${customerData.phone} - ${customerData.name}`);
        continue;
      }

      // Tạo khách hàng
      const customer = await prisma.customer.create({
        data: {
          name: customerData.name,
          phone: customerData.phone,
          birthday: customerData.birthday,
          gender: customerData.gender,
          notes: customerData.notes,
          totalSpent: customerData.totalSpent,
          totalVisits: customerData.totalVisits,
          loyaltyPoints: customerData.loyaltyPoints,
          status: customerData.status,
        },
      });

      // Tạo CustomerProfile với extended fields
      await prisma.customerProfile.upsert({
        where: { customerId: customer.id },
        update: {
          name: customerData.name,
          phone: customerData.phone,
          preferences: {
            email: customerData.email,
            address: customerData.address,
            city: customerData.city,
            province: customerData.province,
            customerCode: customer.id.slice(0, 8).toUpperCase(),
            rank: customerData.totalSpent > 10000000 ? "Hạng Vàng" : customerData.totalSpent > 5000000 ? "Hạng Bạc" : "Hạng Thường",
          },
        },
        create: {
          customerId: customer.id,
          name: customerData.name,
          phone: customerData.phone,
          preferences: {
            email: customerData.email,
            address: customerData.address,
            city: customerData.city,
            province: customerData.province,
            customerCode: customer.id.slice(0, 8).toUpperCase(),
            rank: customerData.totalSpent > 10000000 ? "Hạng Vàng" : customerData.totalSpent > 5000000 ? "Hạng Bạc" : "Hạng Thường",
          },
        },
      });

      console.log(`✅ Đã tạo khách hàng: ${customerData.phone} - ${customerData.name} (${customerData.status})`);
    }

    console.log("✨ Hoàn thành! Đã tạo 10 khách hàng mẫu.");
  } catch (error) {
    console.error("❌ Lỗi khi tạo khách hàng:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCustomers();

