// ============================================
// Seed Initial Salons and Users for Testing
// ============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding salons and users...");

  // Step 1: Create default salon
  let defaultSalon = await prisma.salon.findUnique({
    where: { slug: "chi-tam" },
  });

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

  // Step 3: Migrate existing users to default salon (if they don't have salonId)
  const usersWithoutSalon = await prisma.user.findMany({
    where: { salonId: null },
  });

  if (usersWithoutSalon.length > 0) {
    await prisma.user.updateMany({
      where: { salonId: null },
      data: { salonId: defaultSalon.id },
    });
    console.log(`✅ Migrated ${usersWithoutSalon.length} users to default salon`);
  }

  // Step 4: Migrate existing customers to default salon (if they don't have salonId)
  const customersWithoutSalon = await prisma.customer.findMany({
    where: { salonId: null },
  });

  if (customersWithoutSalon.length > 0) {
    await prisma.customer.updateMany({
      where: { salonId: null },
      data: { salonId: defaultSalon.id },
    });
    console.log(`✅ Migrated ${customersWithoutSalon.length} customers to default salon`);
  }

  // Step 5: Migrate existing bookings to default salon (if they don't have salonId)
  const bookingsWithoutSalon = await prisma.booking.findMany({
    where: { salonId: null },
  });

  if (bookingsWithoutSalon.length > 0) {
    await prisma.booking.updateMany({
      where: { salonId: null },
      data: { salonId: defaultSalon.id },
    });
    console.log(`✅ Migrated ${bookingsWithoutSalon.length} bookings to default salon`);
  }

  // Step 6: Seed users with different roles (using phone instead of email)
  const users = [
    {
      name: "Admin User",
      phone: "0900000001",
      password: "123456", // In production, this should be hashed
      role: "ADMIN" as const,
      salonId: defaultSalon.id,
    },
    {
      name: "Manager User",
      phone: "0900000002",
      password: "123456",
      role: "MANAGER" as const,
      salonId: defaultSalon.id,
    },
    {
      name: "Reception User",
      phone: "0900000003",
      password: "123456",
      role: "RECEPTIONIST" as const,
      salonId: defaultSalon.id,
    },
    {
      name: "Stylist User",
      phone: "0900000004",
      password: "123456",
      role: "STYLIST" as const,
      salonId: defaultSalon.id,
    },
    {
      name: "Assistant User",
      phone: "0900000005",
      password: "123456",
      role: "ASSISTANT" as const,
      salonId: defaultSalon.id,
    },
    // Users for second salon (for testing multi-tenant)
    {
      name: "Admin Salon 2",
      phone: "0900000011",
      password: "123456",
      role: "ADMIN" as const,
      salonId: secondSalon.id,
    },
    {
      name: "Manager Salon 2",
      phone: "0900000012",
      password: "123456",
      role: "MANAGER" as const,
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
      const updates: any = {};
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
        console.log(`✅ Updated user: ${userData.phone} (${userData.role}, salon: ${userData.salonId})`);
      } else {
        console.log(`⏭️  User already exists: ${userData.phone}`);
      }
    } else {
      // Create new user
      await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${userData.phone} (${userData.role}, salon: ${userData.salonId})`);
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

