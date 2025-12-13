// ============================================
// Seed Initial Salons and Users for Testing
// ============================================

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function main() {
  console.log("🌱 Seeding salons and users...");

  // Step 1: Create default salon
  let defaultSalon;
  try {
    defaultSalon = await prisma.salon.findUnique({
      where: { slug: "chi-tam" },
    });
  } catch (error) {
    if (error.code === "P2021") {
      console.error(
        "❌ Table 'Salon' does not exist. Please run migration first:"
      );
      console.error("   npx prisma migrate dev --name add_salon_multi_tenant");
      throw new Error(
        "Migration required. Please run: npx prisma migrate dev --name add_salon_multi_tenant"
      );
    }
    throw error;
  }

  if (!defaultSalon) {
    defaultSalon = await prisma.salon.create({
      data: {
        name: "Chí Tâm Hair Salon",
        slug: "chi-tam",
        status: "ACTIVE",
      },
    });
    console.log(`✅ Created default salon: ${defaultSalon.name}`);
  } else {
    console.log(`⏭️  Default salon already exists: ${defaultSalon.name}`);
  }

  // Step 2: Create second salon for testing multi-tenant
  let secondSalon = await prisma.salon.findUnique({
    where: { slug: "salon-test-2" },
  });

  if (!secondSalon) {
    secondSalon = await prisma.salon.create({
      data: {
        name: "Test Salon 2",
        slug: "salon-test-2",
        status: "ACTIVE",
      },
    });
    console.log(`✅ Created second salon: ${secondSalon.name}`);
  } else {
    console.log(`⏭️  Second salon already exists: ${secondSalon.name}`);
  }

  // Step 3-8: Migration đã được thực hiện trong SQL migration script
  // Tất cả records đã có salonId từ migration, không cần migrate lại
  console.log(`⏭️  Data migration already completed in SQL migration script`);

  // Step 9: Seed users with different roles (using phone instead of email)
  const users = [
    {
      name: "Admin User",
      phone: "0900000001",
      password: "123456", // In production, this should be hashed
      role: "ADMIN",
      salonId: defaultSalon.id,
    },
    {
      name: "Manager User",
      phone: "0900000002",
      password: "123456",
      role: "MANAGER",
      salonId: defaultSalon.id,
    },
    {
      name: "Reception User",
      phone: "0900000003",
      password: "123456",
      role: "RECEPTIONIST",
      salonId: defaultSalon.id,
    },
    {
      name: "Stylist User",
      phone: "0900000004",
      password: "123456",
      role: "STYLIST",
      salonId: defaultSalon.id,
    },
    {
      name: "Assistant User",
      phone: "0900000005",
      password: "123456",
      role: "ASSISTANT",
      salonId: defaultSalon.id,
    },
    // Users for second salon (for testing multi-tenant)
    {
      name: "Admin Salon 2",
      phone: "0900000011",
      password: "123456",
      role: "ADMIN",
      salonId: secondSalon.id,
    },
    {
      name: "Manager Salon 2",
      phone: "0900000012",
      password: "123456",
      role: "MANAGER",
      salonId: secondSalon.id,
    },
  ];

  for (const userData of users) {
    // Check if user exists by phone
    const existing = await prisma.user.findUnique({
      where: { phone: userData.phone },
    });

    if (existing) {
      // Update role and salonId if different
      const updates = {};
      if (existing.role !== userData.role) {
        updates.role = userData.role;
      }
      if (existing.salonId !== userData.salonId) {
        updates.salonId = userData.salonId;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.user.update({
          where: { id: existing.id },
          data: updates,
        });
        console.log(
          `✅ Updated user: ${userData.phone} (${userData.role}, salon: ${userData.salonId})`
        );
      } else {
        console.log(`⏭️  User already exists: ${userData.phone}`);
      }
    } else {
      // Create new user
      await prisma.user.create({
        data: userData,
      });
      console.log(
        `✅ Created user: ${userData.phone} (${userData.role}, salon: ${userData.salonId})`
      );
    }
  }

  // Step 10: Seed test data for Salon 2 (if it exists)
  if (secondSalon) {
    console.log(`🌱 Seeding test data for ${secondSalon.name}...`);

    // Create 5 customers for Salon 2
    const salon2Customers = [];
    for (let i = 1; i <= 5; i++) {
      const customer = await prisma.customer.upsert({
        where: {
          phone: `09000000${10 + i}`,
        },
        update: {},
        create: {
          salonId: secondSalon.id,
          name: `Customer Salon 2 - ${i}`,
          phone: `09000000${10 + i}`,
          status: "ACTIVE",
        },
      });
      salon2Customers.push(customer);
      console.log(`  ✅ Created customer: ${customer.name}`);
    }

    // Create 3 bookings for Salon 2
    const salon2Bookings = [];
    const today = new Date();
    for (let i = 0; i < 3; i++) {
      const bookingDate = new Date(today);
      bookingDate.setDate(today.getDate() + i);
      bookingDate.setHours(10 + i, 0, 0, 0);

      const booking = await prisma.booking.create({
        data: {
          salonId: secondSalon.id,
          customerId: salon2Customers[i % salon2Customers.length].id,
          date: bookingDate,
          status: i === 0 ? "CONFIRMED" : "PENDING",
          notes: `Test booking ${i + 1} for Salon 2`,
        },
      });
      salon2Bookings.push(booking);
      console.log(`  ✅ Created booking: ${booking.id}`);
    }

    // Create 1 invoice for Salon 2
    if (salon2Bookings.length > 0) {
      const invoice = await prisma.invoice.create({
        data: {
          salonId: secondSalon.id,
          bookingId: salon2Bookings[0].id,
          customerId: salon2Customers[0].id,
          date: today,
          total: 500000,
          status: "PAID",
        },
      });
      console.log(`  ✅ Created invoice: ${invoice.id}`);
    }

    console.log(`✅ Test data for ${secondSalon.name} completed!`);
  }

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

