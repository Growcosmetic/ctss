// ============================================
// Visit Timeline - Add Visit
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      customerId,
      date,
      service,
      stylist,
      assistant,
      technical,
      productsUsed,
      totalCharge,
      photosBefore,
      photosAfter,
      notes,
      rating,
      followUpNotes,
      tags,
    } = await req.json();

    if (!customerId || !service) {
      return NextResponse.json(
        { error: "customerId and service are required" },
        { status: 400 }
      );
    }

    // Create visit
    const visit = await prisma.visit.create({
      data: {
        customerId,
        date: date ? new Date(date) : new Date(),
        service,
        stylist: stylist || null,
        assistant: assistant || null,
        technical: technical || null,
        productsUsed: productsUsed || null,
        totalCharge: totalCharge || null,
        photosBefore: photosBefore || [],
        photosAfter: photosAfter || [],
        notes: notes || null,
        rating: rating || null,
        followUpNotes: followUpNotes || null,
        tags: tags || [],
      },
    });

    // Update customer totalVisits & totalSpent
    const updateData: any = {
      totalVisits: {
        increment: 1,
      },
    };

    if (totalCharge) {
      updateData.totalSpent = {
        increment: totalCharge,
      };
    }

    await prisma.customer.update({
      where: { id: customerId },
      data: updateData,
    });

    // Auto create reminders (Phase 17D)
    // Run in background - don't block response
    try {
      // Use internal API call or direct function call
      const reminderCreateUrl = process.env.NEXT_PUBLIC_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/reminders/create`
        : "http://localhost:3000/api/reminders/create";
      
      fetch(reminderCreateUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      }).catch((err) => {
        console.warn("Reminder creation error (non-critical):", err);
      });
    } catch (err) {
      console.warn("Reminder creation error (non-critical):", err);
    }

    // Trigger visit-based automations (Phase 17G)
    try {
      const automationUrl = process.env.NEXT_PUBLIC_BASE_URL 
        ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/automation/trigger-visit`
        : "http://localhost:3000/api/automation/trigger-visit";
      
      fetch(automationUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, visitId: visit.id, service }),
      }).catch((err) => {
        console.warn("Automation trigger error (non-critical):", err);
      });
    } catch (err) {
      console.warn("Automation trigger error (non-critical):", err);
    }

    return NextResponse.json({
      success: true,
      visit,
    });
  } catch (err: any) {
    console.error("Add visit error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to add visit",
      },
      { status: 500 }
    );
  }
}

