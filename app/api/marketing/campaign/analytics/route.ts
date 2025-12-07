// ============================================
// Marketing Campaign - Analytics
// ============================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const {
      campaignId,
      leads,
      bookings,
      customers,
      revenue,
      spent,
    } = await req.json();

    if (!campaignId) {
      return NextResponse.json(
        { error: "campaignId is required" },
        { status: 400 }
      );
    }

    const campaign = await prisma.marketingCampaignV2.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Update campaign metrics
    const updatedLeads = campaign.leads + (leads || 0);
    const updatedBookings = campaign.bookings + (bookings || 0);
    const updatedCustomers = campaign.customers + (customers || 0);
    const updatedRevenue = campaign.revenue + (revenue || 0);
    const updatedSpent = campaign.spent + (spent || 0);

    // Calculate metrics
    const cac = updatedCustomers > 0 ? updatedSpent / updatedCustomers : null;
    const roi = updatedSpent > 0 ? ((updatedRevenue - updatedSpent) / updatedSpent) * 100 : null;

    // Calculate average LTV (simplified - can be enhanced)
    const avgLTV = updatedCustomers > 0 ? updatedRevenue / updatedCustomers : null;

    const updated = await prisma.marketingCampaignV2.update({
      where: { id: campaignId },
      data: {
        leads: updatedLeads,
        bookings: updatedBookings,
        customers: updatedCustomers,
        revenue: updatedRevenue,
        spent: updatedSpent,
        cac: cac ? Math.round(cac * 100) / 100 : null,
        ltv: avgLTV ? Math.round(avgLTV * 100) / 100 : null,
        roi: roi ? Math.round(roi * 100) / 100 : null,
      },
      include: {
        channel: true,
      },
    });

    return NextResponse.json({
      success: true,
      campaign: updated,
    });
  } catch (err: any) {
    console.error("Update campaign analytics error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to update campaign analytics",
      },
      { status: 500 }
    );
  }
}

// Get campaign analytics
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");

    const where: any = {};
    if (campaignId) where.id = campaignId;
    if (status) where.status = status;

    const campaigns = await prisma.marketingCampaignV2.findMany({
      where,
      include: {
        channel: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate overall stats
    const stats = {
      totalCampaigns: campaigns.length,
      totalBudget: campaigns.reduce((sum, c) => sum + c.budget, 0),
      totalSpent: campaigns.reduce((sum, c) => sum + c.spent, 0),
      totalLeads: campaigns.reduce((sum, c) => sum + c.leads, 0),
      totalCustomers: campaigns.reduce((sum, c) => sum + c.customers, 0),
      totalRevenue: campaigns.reduce((sum, c) => sum + c.revenue, 0),
      averageROI: 0,
    };

    const campaignsWithROI = campaigns.filter((c) => c.roi !== null);
    if (campaignsWithROI.length > 0) {
      stats.averageROI =
        campaignsWithROI.reduce((sum, c) => sum + (c.roi || 0), 0) /
        campaignsWithROI.length;
    }

    return NextResponse.json({
      success: true,
      campaigns,
      stats,
    });
  } catch (err: any) {
    console.error("Get campaign analytics error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to get campaign analytics",
      },
      { status: 500 }
    );
  }
}

