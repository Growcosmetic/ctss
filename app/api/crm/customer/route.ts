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
  try {
    const body = await request.json();
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

    if (!firstName || !lastName || !phone) {
      return errorResponse("firstName, lastName, and phone are required", 400);
    }

    const data: any = {
      firstName,
      lastName,
      phone,
      email: email || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender || null,
      address: address || null,
      city: city || null,
      province: province || null,
      postalCode: postalCode || null,
      notes: notes || null,
      preferences: preferences || null,
    };

    let customer;
    if (id) {
      // Update existing customer
      customer = await prisma.customer.update({
        where: { id },
        data,
        include: {
          tags: true,
        },
      });
    } else {
      // Check if customer with phone already exists
      const existing = await prisma.customer.findUnique({
        where: { phone },
      });

      if (existing) {
        // Update existing customer
        customer = await prisma.customer.update({
          where: { id: existing.id },
          data,
          include: {
            tags: true,
          },
        });
      } else {
        // Create new customer
        customer = await prisma.customer.create({
          data,
          include: {
            tags: true,
          },
        });
      }
    }

    return successResponse(customer, id ? "Customer updated successfully" : "Customer created successfully");
  } catch (error: any) {
    if (error.code === "P2002") {
      return errorResponse("Phone number already exists", 400);
    }
    return errorResponse(error.message || "Failed to save customer", 500);
  }
}

