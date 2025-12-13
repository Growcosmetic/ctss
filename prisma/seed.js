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

  // Phase 8: Seed subscription plans
  console.log("🌱 Seeding subscription plans...");
  const { SubscriptionPlan } = require("@prisma/client");
  const PLAN_CONFIGS = {
    FREE: {
      displayName: "Miễn phí",
      price: 0,
      features: {
        POS: false,
        AI: false,
        REPORTS: false,
        MARKETING: false,
        ANALYTICS: false,
        INVENTORY: true,
        TRAINING: false,
        CRM_AUTOMATION: false,
        MULTI_BRANCH: false,
        API_ACCESS: false,
      },
      limits: {
        staff: 3,
        bookings: 100,
        customers: 500,
        invoices: 100,
        storage: 1,
      },
    },
    BASIC: {
      displayName: "Cơ bản",
      price: 500000,
      features: {
        POS: true,
        AI: false,
        REPORTS: true,
        MARKETING: false,
        ANALYTICS: false,
        INVENTORY: true,
        TRAINING: false,
        CRM_AUTOMATION: false,
        MULTI_BRANCH: false,
        API_ACCESS: false,
      },
      limits: {
        staff: 10,
        bookings: 1000,
        customers: 2000,
        invoices: 1000,
        storage: 5,
      },
    },
    PRO: {
      displayName: "Chuyên nghiệp",
      price: 1500000,
      features: {
        POS: true,
        AI: true,
        REPORTS: true,
        MARKETING: true,
        ANALYTICS: true,
        INVENTORY: true,
        TRAINING: true,
        CRM_AUTOMATION: true,
        MULTI_BRANCH: false,
        API_ACCESS: false,
      },
      limits: {
        staff: 50,
        bookings: 10000,
        customers: 10000,
        invoices: 10000,
        storage: 50,
      },
    },
    ENTERPRISE: {
      displayName: "Doanh nghiệp",
      price: 5000000,
      features: {
        POS: true,
        AI: true,
        REPORTS: true,
        MARKETING: true,
        ANALYTICS: true,
        INVENTORY: true,
        TRAINING: true,
        CRM_AUTOMATION: true,
        MULTI_BRANCH: true,
        API_ACCESS: true,
      },
      limits: {
        staff: 999999,
        bookings: 999999,
        customers: 999999,
        invoices: 999999,
        storage: 500,
      },
    },
  };

  for (const [planName, config] of Object.entries(PLAN_CONFIGS)) {
    const plan = await prisma.plan.upsert({
      where: { name: planName },
      update: {
        displayName: config.displayName,
        price: config.price,
        features: config.features,
        limits: config.limits,
      },
      create: {
        name: planName,
        displayName: config.displayName,
        price: config.price,
        features: config.features,
        limits: config.limits,
        isActive: true,
      },
    });
    console.log(`  ✅ Plan: ${plan.displayName}`);
  }

  // Assign FREE plan to default salon if no subscription exists
  const freePlan = await prisma.plan.findUnique({
    where: { name: SubscriptionPlan.FREE },
  });

  if (defaultSalon && freePlan) {
    const existingSubscription = await prisma.subscription.findUnique({
      where: { salonId: defaultSalon.id },
    });

    if (!existingSubscription) {
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 14); // 14 days trial

      await prisma.subscription.create({
        data: {
          salonId: defaultSalon.id,
          planId: freePlan.id,
          status: "TRIAL",
          trialEndsAt,
          currentPeriodStart: new Date(),
          currentPeriodEndsAt: trialEndsAt,
        },
      });

      await prisma.salon.update({
        where: { id: defaultSalon.id },
        data: {
          planId: freePlan.id,
          planStatus: "TRIAL",
          trialEndsAt,
          currentPeriodEndsAt: trialEndsAt,
        },
      });

      console.log(`  ✅ Assigned FREE plan to default salon`);
    }
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

