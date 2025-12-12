// Script để seed dữ liệu mẫu cho Dashboard
// Chạy: node scripts/seed-dashboard-data.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedDashboardData() {
  console.log('🌱 Bắt đầu seed dữ liệu dashboard...');

  try {
    // 0. Tạo hoặc lấy branch mặc định
    console.log('🏢 Tạo/lấy branch...');
    let branch = await prisma.branch.findFirst();
    if (!branch) {
      branch = await prisma.branch.create({
        data: {
          name: 'Chi nhánh Chính',
          address: '123 Đường ABC',
          phone: '0900000000',
          isActive: true,
        },
      });
    }
    console.log(`✅ Sử dụng branch: ${branch.name}`);

    // 1. Tạo một số customers
    console.log('📝 Tạo customers...');
    const customers = [];
    for (let i = 1; i <= 20; i++) {
      const customer = await prisma.customer.upsert({
        where: { phone: `090000000${i.toString().padStart(2, '0')}` },
        update: {},
        create: {
          name: `Khách Hàng ${i}`,
          phone: `090000000${i.toString().padStart(2, '0')}`,
          gender: i % 2 === 0 ? 'FEMALE' : 'MALE',
        },
      });
      customers.push(customer);
    }
    console.log(`✅ Đã tạo ${customers.length} customers`);

    // 2. Tạo một số staff/users
    console.log('👨‍💼 Tạo staff...');
    const staff = [];
    const roles = ['STYLIST', 'ASSISTANT', 'RECEPTIONIST'];
    for (let i = 1; i <= 5; i++) {
      const user = await prisma.user.upsert({
        where: { phone: `091000000${i}` },
        update: {},
        create: {
          name: `Nhân viên ${i}`,
          phone: `091000000${i}`,
          password: '$2a$10$dummy', // Dummy password hash
          role: roles[(i - 1) % roles.length],
        },
      });
      staff.push(user);
    }
    console.log(`✅ Đã tạo ${staff.length} staff`);

    // 3. Tạo bookings cho hôm nay và tuần này
    console.log('📅 Tạo bookings...');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const bookings = [];
    for (let i = 0; i < 15; i++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(bookingDate.getDate() - Math.floor(i / 3));
      bookingDate.setHours(9 + (i % 8), (i % 4) * 15, 0, 0);

      const booking = await prisma.booking.create({
        data: {
          customerId: customers[i % customers.length].id,
          branchId: branch.id,
          date: bookingDate,
          status: i < 5 ? 'CONFIRMED' : i < 10 ? 'COMPLETED' : 'CANCELLED',
          notes: `Booking mẫu ${i + 1}`,
        },
      });
      bookings.push(booking);
    }
    console.log(`✅ Đã tạo ${bookings.length} bookings`);

    // 4. Tạo Invoices (doanh thu) thay vì POS orders
    console.log('💰 Tạo Invoices...');
    const invoices = [];
    for (let i = 0; i < 10; i++) {
      const invoiceDate = new Date(today);
      invoiceDate.setDate(invoiceDate.getDate() - Math.floor(i / 3));
      invoiceDate.setHours(10 + (i % 6), (i % 4) * 15, 0, 0);

      const total = 500000 + Math.random() * 2000000;
      const invoice = await prisma.invoice.create({
        data: {
          customerId: customers[i % customers.length].id,
          branchId: branch.id,
          bookingId: i < bookings.length ? bookings[i].id : null,
          total: Math.round(total),
          date: invoiceDate,
        },
      });
      invoices.push(invoice);
    }
    console.log(`✅ Đã tạo ${invoices.length} invoices`);

    // 5. Tạo staff shifts (cần Staff model, không phải User)
    console.log('⏰ Tạo staff shifts...');
    // Kiểm tra xem có Staff model không, nếu không thì skip
    try {
      const shifts = [];
      for (let i = 0; i < 5; i++) {
        const shiftDate = new Date(today);
        shiftDate.setDate(shiftDate.getDate() - (i % 3));

        // Tạo Staff nếu chưa có
        let staffRecord = await prisma.staff.findFirst({
          where: { userId: staff[i % staff.length].id },
        });
        
        if (!staffRecord) {
          staffRecord = await prisma.staff.create({
            data: {
              userId: staff[i % staff.length].id,
              branchId: branch.id,
              position: roles[(i % roles.length)],
            },
          });
        }

        const shift = await prisma.staffShift.create({
          data: {
            staffId: staffRecord.id,
            date: shiftDate,
            startTime: '09:00',
            endTime: '18:00',
          },
        });
        shifts.push(shift);
      }
      console.log(`✅ Đã tạo ${shifts.length} staff shifts`);
    } catch (error) {
      console.log('⚠️  Không thể tạo staff shifts (có thể model chưa có):', error.message);
    }

    // 6. Tính toán tổng kết
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);
    const todayBookingsCount = bookings.filter(b => {
      const bDate = new Date(b.date);
      return bDate.toDateString() === today.toDateString();
    }).length;

    console.log('\n📊 Tổng kết dữ liệu đã seed:');
    console.log(`   - Branch: ${branch.name}`);
    console.log(`   - Customers: ${customers.length}`);
    console.log(`   - Staff: ${staff.length}`);
    console.log(`   - Bookings: ${bookings.length} (${todayBookingsCount} hôm nay)`);
    console.log(`   - Invoices: ${invoices.length}`);
    console.log(`   - Tổng doanh thu: ${totalRevenue.toLocaleString('vi-VN')} đ`);

    console.log('\n✅ Hoàn tất seed dữ liệu dashboard!');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDashboardData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
