// Script seed CRM qua API (không cần database permission)
// Chạy: node scripts/seed-crm-via-api.js
// Yêu cầu: Dev server phải đang chạy (npm run dev)

const baseUrl = process.env.API_URL || 'http://localhost:3000';

// 1. Customer Groups (tạo qua API)
const groups = [
  "Khách hàng VIP",
  "Khách hàng Thân thiết",
  "Khách hàng Mới",
  "Khách hàng Tiềm năng",
  "Khách hàng Thường xuyên",
];

// 2. Customers với groups
const customers = [
  {
    firstName: "Nguyễn",
    lastName: "Văn An",
    phone: "0901234567",
    email: "nguyenvanan@example.com",
    dateOfBirth: "1990-05-15",
    gender: "MALE",
    address: "123 Đường Nguyễn Huệ, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP, chi tiêu cao",
    preferences: {
      customerGroup: "Khách hàng VIP",
      rank: "Hạng Vàng",
    },
  },
  {
    firstName: "Trần",
    lastName: "Thị Bình",
    phone: "0902345678",
    email: "tranthibinh@example.com",
    dateOfBirth: "1992-08-20",
    gender: "FEMALE",
    address: "456 Đường Lê Lợi, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết, đến đều đặn",
    preferences: {
      customerGroup: "Khách hàng Thân thiết",
      rank: "Hạng Bạc",
    },
  },
  {
    firstName: "Lê",
    lastName: "Văn Cường",
    phone: "0903456789",
    email: "levancuong@example.com",
    dateOfBirth: "1988-12-10",
    gender: "MALE",
    address: "789 Đường Pasteur, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng mới, cần chăm sóc",
    preferences: {
      customerGroup: "Khách hàng Mới",
      rank: "Hạng Thường",
    },
  },
  {
    firstName: "Phạm",
    lastName: "Thị Dung",
    phone: "0904567890",
    email: "phamthidung@example.com",
    dateOfBirth: "1995-03-25",
    gender: "FEMALE",
    address: "321 Đường Điện Biên Phủ, Quận Bình Thạnh",
    city: "Quận Bình Thạnh",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thường xuyên",
    preferences: {
      customerGroup: "Khách hàng Thường xuyên",
      rank: "Hạng Bạc",
    },
  },
  {
    firstName: "Hoàng",
    lastName: "Văn Em",
    phone: "0905678901",
    email: "hoangvanem@example.com",
    dateOfBirth: "1991-07-18",
    gender: "MALE",
    address: "654 Đường Võ Văn Tần, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP cao cấp",
    preferences: {
      customerGroup: "Khách hàng VIP",
      rank: "Hạng Vàng",
    },
  },
  {
    firstName: "Võ",
    lastName: "Thị Phương",
    phone: "0906789012",
    email: "vothiphuong@example.com",
    dateOfBirth: "1993-11-05",
    gender: "FEMALE",
    address: "987 Đường Nguyễn Đình Chiểu, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết",
    preferences: {
      customerGroup: "Khách hàng Thân thiết",
      rank: "Hạng Bạc",
    },
  },
  {
    firstName: "Đặng",
    lastName: "Văn Giang",
    phone: "0907890123",
    email: "dangvangiang@example.com",
    dateOfBirth: "1989-09-30",
    gender: "MALE",
    address: "147 Đường Nam Kỳ Khởi Nghĩa, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng mới",
    preferences: {
      customerGroup: "Khách hàng Mới",
      rank: "Hạng Thường",
    },
  },
  {
    firstName: "Bùi",
    lastName: "Thị Hoa",
    phone: "0908901234",
    email: "buithihoa@example.com",
    dateOfBirth: "1994-04-12",
    gender: "FEMALE",
    address: "258 Đường Cách Mạng Tháng 8, Quận 10",
    city: "Quận 10",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thường xuyên",
    preferences: {
      customerGroup: "Khách hàng Thường xuyên",
      rank: "Hạng Thường",
    },
  },
  {
    firstName: "Ngô",
    lastName: "Văn Ích",
    phone: "0909012345",
    email: "ngovanich@example.com",
    dateOfBirth: "1990-01-22",
    gender: "MALE",
    address: "369 Đường Lý Tự Trọng, Quận 1",
    city: "Quận 1",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP cao cấp",
    preferences: {
      customerGroup: "Khách hàng VIP",
      rank: "Hạng Vàng",
    },
  },
  {
    firstName: "Đỗ",
    lastName: "Thị Kim",
    phone: "0900123456",
    email: "dothikim@example.com",
    dateOfBirth: "1992-06-08",
    gender: "FEMALE",
    address: "741 Đường Trần Hưng Đạo, Quận 5",
    city: "Quận 5",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết",
    preferences: {
      customerGroup: "Khách hàng Thân thiết",
      rank: "Hạng Bạc",
    },
  },
  {
    firstName: "Lý",
    lastName: "Văn Long",
    phone: "0911234567",
    email: "lyvanlong@example.com",
    dateOfBirth: "1987-02-14",
    gender: "MALE",
    address: "852 Đường Nguyễn Trãi, Quận 5",
    city: "Quận 5",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng tiềm năng",
    preferences: {
      customerGroup: "Khách hàng Tiềm năng",
      rank: "Hạng Thường",
    },
  },
  {
    firstName: "Mai",
    lastName: "Thị Lan",
    phone: "0912345678",
    email: "maithilan@example.com",
    dateOfBirth: "1996-10-30",
    gender: "FEMALE",
    address: "963 Đường Võ Thị Sáu, Quận 3",
    city: "Quận 3",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng mới",
    preferences: {
      customerGroup: "Khách hàng Mới",
      rank: "Hạng Thường",
    },
  },
  {
    firstName: "Phan",
    lastName: "Văn Minh",
    phone: "0913456789",
    email: "phanvanminh@example.com",
    dateOfBirth: "1991-12-25",
    gender: "MALE",
    address: "159 Đường Điện Biên Phủ, Quận Bình Thạnh",
    city: "Quận Bình Thạnh",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng VIP",
    preferences: {
      customerGroup: "Khách hàng VIP",
      rank: "Hạng Vàng",
    },
  },
  {
    firstName: "Trương",
    lastName: "Thị Nga",
    phone: "0914567890",
    email: "truongthinga@example.com",
    dateOfBirth: "1993-07-07",
    gender: "FEMALE",
    address: "357 Đường Lê Văn Việt, Quận 9",
    city: "Quận 9",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thường xuyên",
    preferences: {
      customerGroup: "Khách hàng Thường xuyên",
      rank: "Hạng Bạc",
    },
  },
  {
    firstName: "Vũ",
    lastName: "Văn Oanh",
    phone: "0915678901",
    email: "vuvanoanh@example.com",
    dateOfBirth: "1989-04-18",
    gender: "MALE",
    address: "741 Đường Nguyễn Văn Linh, Quận 7",
    city: "Quận 7",
    province: "TP Hồ Chí Minh",
    notes: "Khách hàng thân thiết",
    preferences: {
      customerGroup: "Khách hàng Thân thiết",
      rank: "Hạng Bạc",
    },
  },
];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createGroup(groupName) {
  try {
    const response = await fetch(`${baseUrl}/api/crm/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ groupName }),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Đã tạo group: ${groupName}`);
      return true;
    } else {
      if (result.error && result.error.includes('already exists')) {
        console.log(`⏭️  Group đã tồn tại: ${groupName}`);
        return true;
      }
      console.log(`⚠️  Group ${groupName}: ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi tạo group ${groupName}:`, error.message);
    return false;
  }
}

async function createCustomer(customerData) {
  try {
    const response = await fetch(`${baseUrl}/api/crm/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Đã tạo: ${customerData.firstName} ${customerData.lastName} (${customerData.preferences?.customerGroup || 'Chưa phân nhóm'})`);
      return true;
    } else {
      if (result.error && (result.error.includes('already exists') || result.error.includes('duplicate'))) {
        console.log(`⏭️  Đã tồn tại: ${customerData.firstName} ${customerData.lastName}`);
        return true;
      }
      console.log(`⚠️  ${customerData.firstName} ${customerData.lastName}: ${result.error || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Lỗi tạo khách hàng ${customerData.firstName} ${customerData.lastName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Bắt đầu seed dữ liệu CRM qua API...\n");
  console.log(`📡 Kết nối đến: ${baseUrl}\n`);

  // Kiểm tra server có đang chạy không
  try {
    const healthCheck = await fetch(`${baseUrl}/api/health`).catch(() => null);
    if (!healthCheck) {
      console.log("⚠️  Không thể kết nối đến server!");
      console.log("💡 Hãy chạy: npm run dev");
      process.exit(1);
    }
  } catch (error) {
    console.log("⚠️  Server có thể chưa sẵn sàng, tiếp tục thử...\n");
  }

  // 1. Tạo groups
  console.log("📁 Tạo customer groups...\n");
  for (const groupName of groups) {
    await createGroup(groupName);
    await sleep(200); // Delay để tránh rate limit
  }

  console.log("\n👤 Tạo customers...\n");
  let created = 0;
  let skipped = 0;

  for (const customerData of customers) {
    const success = await createCustomer(customerData);
    if (success) {
      if (customerData.phone) {
        // Check if it was created or skipped
        const checkResponse = await fetch(`${baseUrl}/api/customers?search=${customerData.phone}&limit=1`);
        const checkResult = await checkResponse.json();
        if (checkResult.success && checkResult.data?.customers?.length > 0) {
          created++;
        } else {
          skipped++;
        }
      }
    }
    await sleep(300); // Delay giữa các request
  }

  console.log("\n✨ Hoàn thành seed dữ liệu CRM!");
  console.log("\n📋 Tóm tắt:");
  console.log(`   - Groups: ${groups.length}`);
  console.log(`   - Customers: ${customers.length} (đã tạo: ${created}, đã tồn tại: ${skipped})`);
  console.log("\n🔑 Đăng nhập:");
  console.log("   - Phone: 0900000001 | Password: 123456 (ADMIN)");
  console.log("   - Phone: 0900000002 | Password: 123456 (MANAGER)");
  console.log("   - Phone: 0900000003 | Password: 123456 (RECEPTIONIST)");
  console.log("\n🌐 Truy cập: http://localhost:3000/crm");
}

main().catch((error) => {
  console.error("❌ Lỗi:", error);
  process.exit(1);
});

