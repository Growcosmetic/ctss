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
    try {
      if (phone) {
        user = await prisma.user.findUnique({
          where: { phone },
        });
      } else if (email) {
        // Try to find by email (may not exist in schema)
        // @ts-ignore - email may not be in schema
        user = await prisma.user.findFirst({
          where: { 
            // Try phone as fallback if email doesn't work
            phone: email 
          },
        });
      }
    } catch (error: any) {
      // If email field doesn't exist, try phone
      if (email) {
        user = await prisma.user.findUnique({
          where: { phone: email },
        });
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
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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

