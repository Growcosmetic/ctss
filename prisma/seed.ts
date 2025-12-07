// ============================================
// Seed Initial Users for Testing
// ============================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

  // Seed users with different roles
  const users = [
    {
      email: "admin@ctss.com",
      password: "123456", // In production, this should be hashed
      firstName: "Admin",
      lastName: "User",
      phone: "0900000001",
      role: "ADMIN" as const,
    },
    {
      email: "manager@ctss.com",
      password: "123456",
      firstName: "Manager",
      lastName: "User",
      phone: "0900000002",
      role: "MANAGER" as const,
    },
    {
      email: "reception@ctss.com",
      password: "123456",
      firstName: "Reception",
      lastName: "User",
      phone: "0900000003",
      role: "RECEPTIONIST" as const,
    },
    {
      email: "stylist@ctss.com",
      password: "123456",
      firstName: "Stylist",
      lastName: "User",
      phone: "0900000004",
      role: "STYLIST" as const,
    },
    {
      email: "assistant@ctss.com",
      password: "123456",
      firstName: "Assistant",
      lastName: "User",
      phone: "0900000005",
      role: "ASSISTANT" as const,
    },
  ];

  for (const userData of users) {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existing) {
      // Update role if different
      if (existing.role !== userData.role) {
        await prisma.user.update({
          where: { id: existing.id },
          data: { role: userData.role },
        });
        console.log(`✅ Updated user: ${userData.email} (${userData.role})`);
      } else {
        console.log(`⏭️  User already exists: ${userData.email}`);
      }
    } else {
      // Create new user
      await prisma.user.create({
        data: userData,
      });
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
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

