// Script để tạo 10 khách hàng mẫu thông qua API
// Chạy: node scripts/seed-customers-api.js

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
    notes: "Khách hàng VIP",
    preferences: {
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
    notes: "Khách hàng thân thiết",
    preferences: {
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
    notes: "Khách hàng mới",
    preferences: {
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
      rank: "Hạng Vàng",
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
    notes: "Khách hàng VIP",
    preferences: {
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
      rank: "Hạng Bạc",
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
    notes: "Khách hàng VIP",
    preferences: {
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
      rank: "Hạng Bạc",
    },
  },
];

async function seedCustomers() {
  const baseUrl = process.env.API_URL || 'http://localhost:3000';
  console.log(`🌱 Bắt đầu tạo 10 khách hàng mẫu qua API: ${baseUrl}...\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const customerData of customers) {
    try {
      const response = await fetch(`${baseUrl}/api/crm/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerData),
      });

      let result;
      try {
        const text = await response.text();
        result = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.log(`❌ Lỗi parse JSON cho ${customerData.firstName} ${customerData.lastName}:`, parseError.message);
        console.log(`   Response status: ${response.status}`);
        console.log(`   Response text: ${await response.text()}`);
        errorCount++;
        continue;
      }

      if (response.ok && result.success) {
        console.log(`✅ Đã tạo: ${customerData.firstName} ${customerData.lastName} - ${customerData.phone}`);
        successCount++;
      } else {
        const errorMsg = result.error || result.message || 'Unknown error';
        if (errorMsg.includes('already exists') || errorMsg.includes('đã được sử dụng')) {
          console.log(`⏭️  Đã tồn tại: ${customerData.firstName} ${customerData.lastName} - ${customerData.phone}`);
          skipCount++;
        } else {
          console.log(`❌ Lỗi: ${customerData.firstName} ${customerData.lastName} - ${errorMsg}`);
          errorCount++;
        }
      }
    } catch (error) {
      console.log(`❌ Lỗi khi tạo ${customerData.firstName} ${customerData.lastName}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✨ Hoàn thành!`);
  console.log(`   ✅ Thành công: ${successCount}`);
  console.log(`   ⏭️  Đã tồn tại: ${skipCount}`);
  console.log(`   ❌ Lỗi: ${errorCount}`);
}

// Chạy script
seedCustomers().catch(console.error);

