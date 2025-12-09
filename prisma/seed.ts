// ============================================
// Seed Initial Users for Testing
// ============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

  // Seed users with different roles (using phone instead of email)
  const users = [
    {
      name: "Admin User",
      phone: "0900000001",
      password: "123456", // In production, this should be hashed
      role: "ADMIN" as const,
    },
    {
      name: "Manager User",
      phone: "0900000002",
      password: "123456",
      role: "MANAGER" as const,
    },
    {
      name: "Reception User",
      phone: "0900000003",
      password: "123456",
      role: "RECEPTIONIST" as const,
    },
    {
      name: "Stylist User",
      phone: "0900000004",
      password: "123456",
      role: "STYLIST" as const,
    },
    {
      name: "Assistant User",
      phone: "0900000005",
      password: "123456",
      role: "ASSISTANT" as const,
    },
  ];

  for (const userData of users) {
    // Check if user exists by phone
    const existing = await prisma.user.findUnique({
      where: { phone: userData.phone },
    });

    if (existing) {
      // Update role if different
      if (existing.role !== userData.role) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: userData.role },
        });
        console.log(`✅ Updated user: ${userData.phone} (${userData.role})`);
      } else {
        console.log(`⏭️  User already exists: ${userData.phone}`);
      }
    } else {
      // Create new user
      await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${userData.phone} (${userData.role})`);
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

