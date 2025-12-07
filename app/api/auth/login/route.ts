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
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    if (!user.isActive) {
      return errorResponse("Account is inactive", 403);
    }

    // Check password (simple comparison for now)
    if (!comparePassword(password, user.password)) {
      return errorResponse("Invalid email or password", 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

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

