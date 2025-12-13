import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// Simple password comparison (in production, use bcrypt)
function comparePassword(plain: string, hashed: string): boolean {
  // For now, simple comparison - in production use bcrypt.compare
  return plain === hashed;
}

// Simple token generation (in production, use JWT)
function generateToken(userId: string): string {
  // Simple token - in production use jwt.sign
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, phone } = body;

    if ((!email && !phone) || !password) {
      return errorResponse("Email/phone and password are required", 400);
    }

    // Find user by phone or email (if email field exists)
    let user;
    let dbError = null;
    try {
      if (phone) {
        user = await prisma.user.findUnique({
          where: { phone },
          include: {
            salon: true, // Include salon for salonId
          },
        });
      } else if (email) {
        // Try to find by email (may not exist in schema)
        // @ts-ignore - email may not be in schema
        user = await prisma.user.findFirst({
          where: { 
            // Try phone as fallback if email doesn't work
            phone: email 
          },
          include: {
            salon: true, // Include salon for salonId
          },
        });
      }
    } catch (error: any) {
      dbError = error;
      // If email field doesn't exist, try phone
      if (email) {
        try {
          user = await prisma.user.findUnique({
            where: { phone: email },
            include: {
              salon: true, // Include salon for salonId
            },
          });
        } catch (e) {
          // Still error, will use mock
        }
      }
    }

    // If database error or user not found, use mock login
    if (!user && (dbError || !user)) {
      const isDbError = dbError && (
        dbError.message?.includes("denied access") || 
        dbError.message?.includes("ECONNREFUSED") ||
        dbError.message?.includes("P1001") ||
        dbError.code === "P1001"
      );

      if (isDbError) {
        console.warn("Database connection failed, using mock login");
        // Mock users for localhost development
        // Get default salon for mock users
        const defaultSalon = await prisma.salon.findFirst({
          where: { slug: "chi-tam" },
        }).catch(() => null);

        const mockUsers: any = {
          "0900000001": { id: "mock-admin", name: "Admin User", phone: "0900000001", password: "123456", role: "ADMIN", salonId: defaultSalon?.id || "mock-salon-1" },
          "0900000002": { id: "mock-manager", name: "Manager User", phone: "0900000002", password: "123456", role: "MANAGER", salonId: defaultSalon?.id || "mock-salon-1" },
          "0900000003": { id: "mock-reception", name: "Reception User", phone: "0900000003", password: "123456", role: "RECEPTIONIST", salonId: defaultSalon?.id || "mock-salon-1" },
          "0900000004": { id: "mock-stylist", name: "Stylist User", phone: "0900000004", password: "123456", role: "STYLIST", salonId: defaultSalon?.id || "mock-salon-1" },
          "0900000005": { id: "mock-assistant", name: "Assistant User", phone: "0900000005", password: "123456", role: "ASSISTANT", salonId: defaultSalon?.id || "mock-salon-1" },
          "admin@ctss.com": { id: "mock-admin", name: "Admin User", phone: "0900000001", password: "123456", role: "ADMIN", salonId: defaultSalon?.id || "mock-salon-1" },
        };

        const loginKey = phone || email || "";
        const mockUser = mockUsers[loginKey];

        if (mockUser && comparePassword(password, mockUser.password)) {
          const token = generateToken(mockUser.id);
          const cookieStore = await cookies();
          cookieStore.set("auth-token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
          });

          const { password: _, ...userWithoutPassword } = mockUser;
          return successResponse({
            user: userWithoutPassword,
            token,
          });
        } else {
          return errorResponse("Invalid email or password", 401);
        }
      }
    }

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    // Note: isActive field may not exist in User model
    // if (user.isActive === false) {
    //   return errorResponse("Account is inactive", 403);
    // }

    // Check password (simple comparison for now)
    if (!comparePassword(password, user.password)) {
      return errorResponse("Invalid email or password", 401);
    }

    // Update last login (if field exists)
    // Note: lastLoginAt may not exist in User model
    // try {
    //   await prisma.user.update({
    //     where: { id: user.id },
    //     data: { lastLoginAt: new Date() },
    //   });
    // } catch (error) {
    //   // Field doesn't exist, skip
    // }

    // Generate token
    const token = generateToken(user.id);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: false, // Set to false for HTTP (not HTTPS)
      sameSite: "lax",
      path: "/", // Important: set path to root
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return user (without password)
    const { password: _, ...userWithoutPassword } = user;

    return successResponse({
      user: userWithoutPassword,
      token,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Login failed", 500);
  }
}

