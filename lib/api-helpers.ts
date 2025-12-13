import { NextRequest } from "next/server";
import { errorResponse } from "./api-response";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

/**
 * Get current user from session/cookie
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;
    
    if (!token) {
      return null;
    }

    // Simple token validation (in production, use JWT verify)
    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [userId] = decoded.split(":");
      return userId || null;
    } catch {
      return null;
    }
  } catch {
    return null;
  }
}

/**
 * Get current salonId from request (session/JWT)
 * Returns salonId or null if not found
 */
export async function getCurrentSalonId(request?: NextRequest): Promise<string | null> {
  // Try to get from header (for API calls)
  if (request) {
    const salonIdHeader = request.headers.get("x-salon-id");
    if (salonIdHeader) {
      return salonIdHeader;
    }
  }

  // Get from user session
  const userId = await getCurrentUserId();
  if (!userId) {
    // Fallback to default salon
    const defaultSalon = await prisma.salon.findFirst({
      where: { slug: "chi-tam" },
    }).catch(() => null);
    return defaultSalon?.id || null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { salonId: true },
    });
    
    return user?.salonId || null;
  } catch {
    // Fallback to default salon
    const defaultSalon = await prisma.salon.findFirst({
      where: { slug: "chi-tam" },
    }).catch(() => null);
    return defaultSalon?.id || null;
  }
}

/**
 * Require salonId from request
 * Returns salonId or throws 401/403 error
 */
export async function requireSalonId(request: NextRequest): Promise<string> {
  const salonId = await getCurrentSalonId(request);
  
  if (!salonId) {
    throw new Error("Salon ID is required");
  }
  
  return salonId;
}

/**
 * Get salon filter object for Prisma queries
 */
export function getSalonFilter(salonId: string) {
  return { salonId };
}

/**
 * Verify that a record belongs to the current salon
 * Throws 403 if record doesn't belong to salon
 */
export async function verifySalonAccess(
  salonId: string,
  model: string,
  recordId: string
): Promise<void> {
  const record = await (prisma as any)[model].findUnique({
    where: { id: recordId },
    select: { salonId: true },
  });

  if (!record) {
    throw new Error(`${model} not found`);
  }

  if (record.salonId !== salonId) {
    throw new Error(`Access denied: ${model} does not belong to your salon`);
  }
}

