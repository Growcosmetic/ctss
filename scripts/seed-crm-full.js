// Script seed đầy đủ dữ liệu CRM để demo các tính năng
// Chạy: node scripts/seed-crm-full.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Seed Users
const users = [
  {
    name: "Admin User",
    phone: "0900000001",
    password: "123456",
    role: "ADMIN",
  },
  {
    name: "Manager User",
    phone: "0900000002",
    password: "123456",
    role: "MANAGER",
  },
  {
    name: "Reception User",
    phone: "0900000003",
    password: "123456",
    role: "RECEPTIONIST",
  },
];

// 2. Customer Groups
const groups = [
  "Khách hàng VIP",
  "Khách hàng Thân thiết",
  "Khách hàng Mới",
  "Khách hàng Tiềm năng",
  "Khách hàng Thường xuyên",
];

// 3. Customers với groups
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
    notes: "Khách hàng VIP, chi tiêu cao",
    totalSpent: 5000000,
    totalVisits: 10,
    loyaltyPoints: 500,
    status: "ACTIVE",
    group: "Khách hàng VIP",
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
    notes: "Khách hàng thân thiết, đến đều đặn",
    totalSpent: 3000000,
    totalVisits: 8,
    loyaltyPoints: 300,
    status: "ACTIVE",
    group: "Khách hàng Thân thiết",
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
    notes: "Khách hàng mới, cần chăm sóc",
    totalSpent: 1000000,
    totalVisits: 3,
    loyaltyPoints: 100,
    status: "ACTIVE",
    group: "Khách hàng Mới",
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
    group: "Khách hàng Thường xuyên",
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
    notes: "Khách hàng VIP cao cấp",
    totalSpent: 12000000,
    totalVisits: 20,
    loyaltyPoints: 1200,
    status: "ACTIVE",
    group: "Khách hàng VIP",
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
    group: "Khách hàng Thân thiết",
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
    group: "Khách hàng Mới",
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
    group: "Khách hàng Thường xuyên",
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
    notes: "Khách hàng VIP cao cấp",
    totalSpent: 15000000,
    totalVisits: 25,
    loyaltyPoints: 1500,
    status: "ACTIVE",
    group: "Khách hàng VIP",
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
    group: "Khách hàng Thân thiết",
  },
  {
    name: "Lý Văn Long",
    phone: "0911234567",
    email: "lyvanlong@example.com",
    birthday: new Date("1987-02-14"),
    gender: "MALE",
    address: "852 Đường Nguyễn Trãi, Quận 5",
    city: "Quận 5",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng tiềm năng",
    totalSpent: 2000000,
    totalVisits: 5,
    loyaltyPoints: 200,
    status: "ACTIVE",
    group: "Khách hàng Tiềm năng",
  },
  {
    name: "Mai Thị Lan",
    phone: "0912345678",
    email: "maithilan@example.com",
    birthday: new Date("1996-10-30"),
    gender: "FEMALE",
    address: "963 Đường Võ Thị Sáu, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng mới",
    totalSpent: 800000,
    totalVisits: 2,
    loyaltyPoints: 80,
    status: "ACTIVE",
    group: "Khách hàng Mới",
  },
  {
    name: "Phan Văn Minh",
    phone: "0913456789",
    email: "phanvanminh@example.com",
    birthday: new Date("1991-12-25"),
    gender: "MALE",
    address: "159 Đường Điện Biên Phủ, Quận Bình Thạnh",
    city: "Quận Bình Thạnh",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP",
    totalSpent: 11000000,
    totalVisits: 18,
    loyaltyPoints: 1100,
    status: "ACTIVE",
    group: "Khách hàng VIP",
  },
  {
    name: "Trương Thị Nga",
    phone: "0914567890",
    email: "truongthinga@example.com",
    birthday: new Date("1993-07-07"),
    gender: "FEMALE",
    address: "357 Đường Lê Văn Việt, Quận 9",
    city: "Quận 9",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thường xuyên",
    totalSpent: 5500000,
    totalVisits: 11,
    loyaltyPoints: 550,
    status: "ACTIVE",
    group: "Khách hàng Thường xuyên",
  },
  {
    name: "Vũ Văn Oanh",
    phone: "0915678901",
    email: "vuvanoanh@example.com",
    birthday: new Date("1989-04-18"),
    gender: "MALE",
    address: "741 Đường Nguyễn Văn Linh, Quận 7",
    city: "Quận 7",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết",
    totalSpent: 4500000,
    totalVisits: 10,
    loyaltyPoints: 450,
    status: "ACTIVE",
    group: "Khách hàng Thân thiết",
  },
];

async function seedUsers() {
  console.log("\n👥 Seeding users...");
  for (const userData of users) {
    try {
      const existing = await prisma.user.findUnique({
        where: { phone: userData.phone },
      });

      if (existing) {
        console.log(`⏭️  User đã tồn tại: ${userData.phone}`);
      } else {
        await prisma.user.create({ data: userData });
        console.log(`✅ Đã tạo user: ${userData.phone} (${userData.role})`);
      }
    } catch (error) {
      console.error(`❌ Lỗi tạo user ${userData.phone}:`, error.message);
    }
  }
}

async function seedGroups() {
  console.log("\n📁 Seeding customer groups...");
  for (const groupName of groups) {
    try {
      // Kiểm tra xem group đã tồn tại chưa (qua placeholder customer)
      const existingPlaceholder = await prisma.customer.findFirst({
        where: {
          phone: { startsWith: "GROUP_" },
          profile: {
            preferences: {
              path: ["customerGroup"],
              equals: groupName,
            },
          },
        },
      });

      if (existingPlaceholder) {
        console.log(`⏭️  Group đã tồn tại: ${groupName}`);
        continue;
      }

      // Tạo placeholder customer để persist group
      const placeholderPhone = `GROUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const placeholderCustomer = await prisma.customer.create({
        data: {
          name: `[Nhóm] ${groupName}`,
          phone: placeholderPhone,
          status: "INACTIVE",
        },
      });

      await prisma.customerProfile.create({
        data: {
          customerId: placeholderCustomer.id,
          name: `[Nhóm] ${groupName}`,
          phone: placeholderPhone,
          preferences: {
            customerGroup: groupName,
            isGroupPlaceholder: true,
          },
        },
      });

      console.log(`✅ Đã tạo group: ${groupName}`);
    } catch (error) {
      console.error(`❌ Lỗi tạo group ${groupName}:`, error.message);
    }
  }
}

async function seedCustomers() {
  console.log("\n👤 Seeding customers...");
  let created = 0;
  let skipped = 0;

  for (const customerData of customers) {
    try {
      const existing = await prisma.customer.findUnique({
        where: { phone: customerData.phone },
      });

      if (existing) {
        console.log(`⏭️  Khách hàng đã tồn tại: ${customerData.phone} - ${customerData.name}`);
        skipped++;
        continue;
      }

      // Tạo customer
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

      // Tạo CustomerProfile với group
      await prisma.customerProfile.create({
        data: {
          customerId: customer.id,
          name: customerData.name,
          phone: customerData.phone,
          preferences: {
            email: customerData.email,
            address: customerData.address,
            city: customerData.city,
            province: customerData.province,
            customerGroup: customerData.group || "Chưa phân nhóm",
            customerCode: customer.id.slice(0, 8).toUpperCase(),
            rank: customerData.totalSpent > 10000000 ? "Hạng Vàng" : customerData.totalSpent > 5000000 ? "Hạng Bạc" : "Hạng Thường",
          },
        },
      });

      console.log(`✅ Đã tạo: ${customerData.name} (${customerData.group})`);
      created++;
    } catch (error) {
      console.error(`❌ Lỗi tạo khách hàng ${customerData.name}:`, error.message);
    }
  }

  console.log(`\n📊 Tổng kết: Đã tạo ${created} khách hàng, bỏ qua ${skipped} khách hàng đã tồn tại`);
}

async function seedPhotos() {
  console.log("\n📸 Seeding customer photos...");
  
  // Lấy một vài khách hàng để thêm ảnh
  const sampleCustomers = await prisma.customer.findMany({
    take: 5,
    include: { profile: true },
  });

  const samplePhotos = [
    {
      description: "Kiểu tóc trước khi làm",
      uploadedBy: "Admin",
    },
    {
      description: "Kiểu tóc sau khi làm",
      uploadedBy: "Stylist",
    },
    {
      description: "Màu tóc yêu thích",
      uploadedBy: "Manager",
    },
  ];

  let photoCount = 0;
  for (const customer of sampleCustomers) {
    // Thêm 1-2 ảnh cho mỗi khách hàng
    const numPhotos = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < numPhotos; i++) {
      try {
        const photoData = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
        await prisma.customerPhoto.create({
          data: {
            customerId: customer.id,
            imageUrl: `https://picsum.photos/400/300?random=${Date.now()}-${i}`,
            description: photoData.description,
            uploadedBy: photoData.uploadedBy,
          },
        });
        photoCount++;
      } catch (error) {
        console.error(`❌ Lỗi tạo ảnh cho ${customer.name}:`, error.message);
      }
    }
  }

  console.log(`✅ Đã tạo ${photoCount} ảnh mẫu cho khách hàng`);
}

async function main() {
  try {
    console.log("🚀 Bắt đầu seed dữ liệu CRM đầy đủ...\n");

    await seedUsers();
    await seedGroups();
    await seedCustomers();
    await seedPhotos();

    console.log("\n✨ Hoàn thành seed dữ liệu CRM!");
    console.log("\n📋 Tóm tắt:");
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Groups: ${groups.length}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log("\n🔑 Đăng nhập:");
    console.log("   - Phone: 0900000001 | Password: 123456 (ADMIN)");
    console.log("   - Phone: 0900000002 | Password: 123456 (MANAGER)");
    console.log("   - Phone: 0900000003 | Password: 123456 (RECEPTIONIST)");
    console.log("\n🌐 Truy cập: http://localhost:3000/crm");
  } catch (error) {
    console.error("❌ Lỗi seed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();

