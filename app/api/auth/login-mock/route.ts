// ============================================
// MOCK LOGIN - For testing without database
// ============================================

import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { cookies } from "next/headers";

// Mock users
const MOCK_USERS = [
  {
    id: "mock-admin-1",
    email: "admin@ctss.com",
    password: "123456",
    firstName: "Admin",
    lastName: "User",
    role: "ADMIN",
  },
  {
    id: "mock-manager-1",
    email: "manager@ctss.com",
    password: "123456",
    firstName: "Manager",
    lastName: "User",
    role: "MANAGER",
  },
  {
    id: "mock-reception-1",
    email: "reception@ctss.com",
    password: "123456",
    firstName: "Reception",
    lastName: "User",
    role: "RECEPTIONIST",
  },
  {
    id: "mock-stylist-1",
    email: "stylist@ctss.com",
    password: "123456",
    firstName: "Stylist",
    lastName: "User",
    role: "STYLIST",
  },
  {
    id: "mock-assistant-1",
    email: "assistant@ctss.com",
    password: "123456",
    firstName: "Assistant",
    lastName: "User",
    role: "ASSISTANT",
  },
];

// Simple token generation
function generateToken(userId: string): string {
  return Buffer.from(`${userId}:${Date.now()}`).toString("base64");
}

// POST /api/auth/login-mock
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return errorResponse("Email and password are required", 400);
    }

    // Find mock user
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

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
      user: {
        ...userWithoutPassword,
        phone: "0900000001",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      token,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Login failed", 500);
  }
}

