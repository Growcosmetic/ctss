import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "./api-response";
import { prisma } from "./prisma";
import { cookies } from "next/headers";

/**
 * Audit log entry interface
 */
interface AuditLog {
  time: string;
  userId: string | null;
  salonId: string | null;
  method: string;
  path: string;
  status: number;
  error?: string;
}

/**
 * Lightweight audit logging
 */
function auditLog(log: AuditLog) {
  // Only log admin + sensitive endpoints
  const sensitivePaths = [
    "/api/admin",
    "/api/customers",
    "/api/bookings",
    "/api/pos",
    "/api/inventory",
    "/api/services",
  ];

  const isSensitive = sensitivePaths.some((path) => log.path.startsWith(path));

  if (isSensitive || log.status >= 400) {
    console.log(
      `[AUDIT] ${log.time} | ${log.method} ${log.path} | User: ${log.userId || "anonymous"} | Salon: ${log.salonId || "none"} | Status: ${log.status}${log.error ? ` | Error: ${log.error}` : ""}`
    );
  }
}

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
 * Returns salonId or throws error (will be caught and return 401/403)
 */
export async function requireSalonId(request: NextRequest): Promise<string> {
  const salonId = await getCurrentSalonId(request);
  
  if (!salonId) {
    const error = new Error("Salon ID is required");
    (error as any).statusCode = 401;
    throw error;
  }
  
  return salonId;
}

/**
 * Respond with 401 Unauthorized
 */
export function respondUnauthorized(message: string = "Unauthorized") {
  return errorResponse(message, 401);
}

/**
 * Respond with 404 Not Found (to avoid leaking existence)
 */
export function respondNotFound(message: string = "Not found") {
  return errorResponse(message, 404);
}

/**
 * Get salon filter object for Prisma queries
 */
export function getSalonFilter(salonId: string) {
  return { salonId };
}

/**
 * Verify that a record belongs to the current salon
 * Returns record if valid, throws error if not found or wrong salon
 * Returns 404 (not 403) to avoid leaking existence
 */
export async function verifySalonAccess<T = any>(
  currentSalonId: string,
  model: string,
  recordId: string,
  select?: Record<string, boolean>
): Promise<T> {
  const record = await (prisma as any)[model].findUnique({
    where: { id: recordId },
    select: select || { salonId: true },
  });

  if (!record) {
    const error = new Error(`${model} not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  if (record.salonId !== currentSalonId) {
    // Return 404 instead of 403 to avoid leaking existence
    const error = new Error(`${model} not found`);
    (error as any).statusCode = 404;
    throw error;
  }

  return record as T;
}

/**
 * Wrapper for API handlers with salon guard
 * Automatically requires salonId and handles errors
 */
export function withSalonGuard<T = any>(
  handler: (request: NextRequest, salonId: string, ...args: any[]) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse<T>> => {
    const startTime = Date.now();
    const userId = await getCurrentUserId();
    let salonId: string | null = null;
    let status = 200;
    let error: string | undefined;

    try {
      salonId = await requireSalonId(request);
      const response = await handler(request, salonId, ...args);
      status = response.status;
      return response;
    } catch (err: any) {
      status = err.statusCode || 500;
      error = err.message || "Internal server error";

      if (status === 401 || status === 403) {
        return respondUnauthorized(error) as NextResponse<T>;
      }

      if (status === 404) {
        return respondNotFound(error) as NextResponse<T>;
      }

      return errorResponse(error, status) as NextResponse<T>;
    } finally {
      // Audit log
      const path = request.nextUrl.pathname;
      auditLog({
        time: new Date().toISOString(),
        userId,
        salonId,
        method: request.method,
        path,
        status,
        error,
      });
    }
  };
}

