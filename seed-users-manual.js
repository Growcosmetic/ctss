// Manual seed users script (không cần tsx)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding users...");

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
    {
      name: "Stylist User",
      phone: "0900000004",
      password: "123456",
      role: "STYLIST",
    },
    {
      name: "Assistant User",
      phone: "0900000005",
      password: "123456",
      role: "ASSISTANT",
    },
  ];

  for (const userData of users) {
    try {
      // Check if user exists by phone
      const existing = await prisma.user.findUnique({
        where: { phone: userData.phone },
      });

      if (existing) {
        console.log(`⏭️  User already exists: ${userData.phone}`);
      } else {
        // Create new user
        const user = await prisma.user.create({
          data: userData,
        });
        console.log(`✅ Created user: ${userData.phone} (${userData.role})`);
      }
    } catch (error) {
      console.error(`❌ Error creating user ${userData.phone}:`, error.message);
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

