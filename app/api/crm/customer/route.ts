import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/api-response";

// GET /api/crm/customer?phone=... or ?id=...
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const phone = searchParams.get("phone");
    const id = searchParams.get("id");

    if (!phone && !id) {
      return errorResponse("phone or id is required", 400);
    }

    const where: any = {};
    if (id) {
      where.id = id;
    } else if (phone) {
      where.phone = phone;
    }

    const customer = await prisma.customer.findFirst({
      where,
      include: {
        tags: {
          orderBy: { createdAt: "desc" },
        },
        bookings: {
          take: 10,
          orderBy: { date: "desc" },
          include: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        invoices: {
          take: 10,
          orderBy: { date: "desc" },
          include: {
            items: {
              include: {
                service: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!customer) {
      return successResponse(null, "Customer not found", 404);
    }

    // Aggregate recent services from invoice items
    const allInvoiceItems = await prisma.invoiceItem.findMany({
      where: {
        invoice: {
          customerId: customer.id,
        },
        serviceId: {
          not: null,
        },
      },
      include: {
        service: {
          select: {
            id: true,
            name: true,
          },
        },
         invoice: {
           select: {
             date: true,
           },
         },
      },
      orderBy: {
        invoice: {
          date: "desc",
        },
      },
    });

    // Group services by serviceId
    const serviceMap = new Map<string, { serviceId: string; serviceName: string; count: number; lastUsed: string }>();
    
    allInvoiceItems.forEach((item) => {
      if (item.service) {
        const existing = serviceMap.get(item.serviceId || "");
        if (existing) {
          existing.count += 1; // InvoiceItem doesn't have quantity, count by item
          const invoiceDate = new Date(item.invoice.date);
          const lastUsedDate = new Date(existing.lastUsed);
          if (invoiceDate > lastUsedDate) {
            existing.lastUsed = item.invoice.date.toISOString();
          }
        } else {
          serviceMap.set(item.serviceId || "", {
            serviceId: item.service.id,
            serviceName: item.service.name,
            count: 1, // InvoiceItem doesn't have quantity, count by item
            lastUsed: item.invoice.date.toISOString(),
          });
        }
      }
    });

    const recentServices = Array.from(serviceMap.values())
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
      .slice(0, 10);

    return successResponse({
      ...customer,
      recentServices,
    });
  } catch (error: any) {
    return errorResponse(error.message || "Failed to fetch customer", 500);
  }
}

// POST /api/crm/customer
export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
  } catch (parseError) {
    return errorResponse("Invalid JSON body", 400);
  }

  try {
    const {
      id,
      firstName,
      lastName,
      phone,
      email,
      dateOfBirth,
      gender,
      address,
      city,
      province,
      postalCode,
      notes,
      preferences,
    } = body;

    // Validate required fields
    if (!phone) {
      return errorResponse("Số điện thoại là bắt buộc", 400);
    }

    // Validate phone format (basic)
    if (!/^[0-9]{10,11}$/.test(phone.replace(/\s/g, ""))) {
      return errorResponse("Số điện thoại không hợp lệ (10-11 chữ số)", 400);
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return errorResponse("Email không hợp lệ", 400);
    }

    // Check if phone already exists (for new customers or when phone changes)
    if (!id || (id && phone)) {
      const existingByPhone = await prisma.customer.findUnique({
        where: { phone },
      });
      if (existingByPhone && existingByPhone.id !== id) {
        return errorResponse("Số điện thoại này đã được sử dụng bởi khách hàng khác", 400);
      }
    }

    // Check if email already exists (if provided)
    if (email) {
      // Note: Email is stored in CustomerProfile, so we need to check there
      const existingByEmail = await prisma.customerProfile.findFirst({
        where: {
          preferences: {
            path: ["email"],
            equals: email,
          },
        },
        include: {
          customer: true,
        },
      });
      if (existingByEmail && existingByEmail.customerId !== id) {
        return errorResponse("Email này đã được sử dụng bởi khách hàng khác", 400);
      }
    }

    // Combine firstName and lastName into name
    const fullName = [firstName, lastName].filter(Boolean).join(" ").trim() || "Khách hàng";

    // Prepare Customer data (matching schema)
    const customerData: any = {
      name: fullName,
      phone,
      birthday: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      notes: notes || null,
    };

    let customer;
    let finalCustomerId: string | undefined = id;
    
    if (id) {
      // Update existing customer
      customer = await prisma.customer.update({
        where: { id },
        data: customerData,
        include: {
          tags: true,
        },
      });
      finalCustomerId = id;
    } else {
      // Check if customer with phone already exists
      const existing = await prisma.customer.findUnique({
        where: { phone },
      });

      if (existing) {
        // Update existing customer
        customer = await prisma.customer.update({
          where: { id: existing.id },
          data: customerData,
          include: {
            tags: true,
          },
        });
        // Use existing ID for profile update
        finalCustomerId = existing.id;
      } else {
        // Create new customer
        customer = await prisma.customer.create({
          data: customerData,
          include: {
            tags: true,
          },
        });
        finalCustomerId = customer.id;
      }
    }

    // Prepare CustomerProfile data (for extended fields)
    const profilePreferences: any = {
      ...(preferences || {}),
      // Store additional fields in preferences
      email: email || null,
      address: address || null,
      city: city || null,
      province: province || null,
      postalCode: postalCode || null,
      // Store form-specific fields
      customerCode: preferences?.customerCode || null,
      occupation: preferences?.occupation || null,
      rank: preferences?.rank || null,
      website: preferences?.website || null,
      customerGroup: preferences?.customerGroup || null,
      country: preferences?.country || null,
      cardId: preferences?.cardId || null,
      zaloPhone: preferences?.zaloPhone || null,
      facebook: preferences?.facebook || null,
      company: preferences?.company || null,
      referralSource: preferences?.referralSource || null,
    };

    // Upsert CustomerProfile
    const customerId = finalCustomerId!;
    await prisma.customerProfile.upsert({
      where: { customerId },
      update: {
        name: fullName,
        phone: phone,
        preferences: profilePreferences,
        updatedAt: new Date(),
      },
      create: {
        customerId,
        name: fullName,
        phone: phone,
        preferences: profilePreferences,
      },
    });

    return successResponse(customer, id ? "Customer updated successfully" : "Customer created successfully");
  } catch (error: any) {
    console.error("Error saving customer:", error);
    
    // Handle database connection errors
    if (error.message?.includes("denied access") || 
        error.message?.includes("ECONNREFUSED") ||
        error.message?.includes("P1001") ||
        error.code === "P1001") {
      console.warn("Database connection failed, returning mock response");
      
      // Return mock response for development/testing
      const mockCustomer = {
        id: id || `mock-${Date.now()}`,
        name: [firstName, lastName].filter(Boolean).join(" ").trim() || "Khách hàng",
        phone,
        birthday: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender || null,
        notes: notes || null,
        totalSpent: 0,
        totalVisits: 0,
        loyaltyPoints: 0,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return successResponse(
        mockCustomer,
        id ? "Customer updated successfully (mock - database not available)" : "Customer created successfully (mock - database not available)",
        201
      );
    }
    
    if (error.code === "P2002") {
      return errorResponse("Phone number already exists", 400);
    }
    
    return errorResponse(error.message || "Failed to save customer", 500);
  }
}

