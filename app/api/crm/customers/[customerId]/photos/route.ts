import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/crm/customers/[customerId]/photos - Get all photos for a customer
export async function GET(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    try {
      const photos = await prisma.customerPhoto.findMany({
        where: { customerId },
        orderBy: { createdAt: "desc" },
      });

      return successResponse(photos);
    } catch (dbError: any) {
      // Fallback for mock data
      if (
        dbError.message?.includes("denied access") ||
        dbError.message?.includes("ECONNREFUSED") ||
        dbError.message?.includes("P1001") ||
        dbError.code === "P1001"
      ) {
        console.warn("Database connection failed, using mock photos");
        return successResponse([]);
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error fetching customer photos:", error);
    return errorResponse(error.message || "Failed to fetch customer photos", 500);
  }
}

// POST /api/crm/customers/[customerId]/photos - Upload a new photo
export async function POST(
  request: NextRequest,
  { params }: { params: { customerId: string } }
) {
  try {
    const { customerId } = params;
    const body = await request.json();
    const { imageUrl, description, uploadedBy } = body;

    if (!customerId) {
      return errorResponse("customerId is required", 400);
    }

    if (!imageUrl || typeof imageUrl !== "string") {
      return errorResponse("imageUrl is required", 400);
    }

    // Verify customer exists
    try {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        return errorResponse("Customer not found", 404);
      }

      const photo = await prisma.customerPhoto.create({
        data: {
          customerId,
          imageUrl,
          description: description || null,
          uploadedBy: uploadedBy || null,
        },
      });

      return successResponse(photo, "Photo uploaded successfully");
    } catch (dbError: any) {
      // Fallback for mock data
      if (
        dbError.message?.includes("denied access") ||
        dbError.message?.includes("ECONNREFUSED") ||
        dbError.message?.includes("P1001") ||
        dbError.code === "P1001"
      ) {
        console.warn("Database connection failed, returning mock response");
        return successResponse(
          {
            id: `mock-photo-${Date.now()}`,
            customerId,
            imageUrl,
            description: description || null,
            uploadedBy: uploadedBy || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          "Photo uploaded successfully (mock - database not available)"
        );
      }
      throw dbError;
    }
  } catch (error: any) {
    console.error("Error uploading customer photo:", error);
    return errorResponse(error.message || "Failed to upload customer photo", 500);
  }
}

