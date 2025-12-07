// ============================================
// Reminders - Create Reminders
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTags } from "@/core/crm/tagRules";
import { generateReminders, generateAppointmentReminder } from "@/core/crm/reminderRules";

export async function POST(req: Request) {
  try {
    const { customerId, type, appointmentDate, service, stylist } = await req.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "customerId is required" },
        { status: 400 }
      );
    }

    // Get customer data
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        name: true,
        phone: true,
        totalVisits: true,
        totalSpent: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Get visits
    const visits = await prisma.visit.findMany({
      where: { customerId },
      orderBy: { date: "desc" },
    });

    let reminders: any[] = [];

    // If appointment reminder type
    if (type === "appointment" && appointmentDate && service) {
      const reminder = generateAppointmentReminder(
        customer.name,
        new Date(appointmentDate),
        service,
        stylist
      );
      reminders = [reminder];
    } else {
      // Auto generate based on customer data
      const tags = generateTags(customer, visits).map((t) => t.tag);
      const generated = generateReminders(customer, visits, tags);
      reminders = generated;
    }

    // Delete existing unsent reminders for this customer (to avoid duplicates)
    await prisma.reminder.deleteMany({
      where: {
        customerId,
        sent: false,
        type: type || undefined,
      },
    });

    // Create new reminders
    if (reminders.length > 0) {
      await prisma.reminder.createMany({
        data: reminders.map((r) => ({
          customerId,
          type: r.type,
          sendAt: r.sendAt,
          channel: r.channel || "zalo",
          message: r.message,
          metadata: r.metadata || null,
        })),
      });
    }

    return NextResponse.json({
      success: true,
      reminders,
      total: reminders.length,
    });
  } catch (err: any) {
    console.error("Create reminders error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to create reminders",
      },
      { status: 500 }
    );
  }
}

