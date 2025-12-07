// ============================================
// CRM Tag Rules Engine - Auto Generate Tags
// ============================================

interface Customer {
  id: string;
  totalVisits: number;
  totalSpent: number;
  riskLevel?: string | null;
  preferredStylist?: string | null;
  createdAt: Date;
}

interface Visit {
  id: string;
  date: Date;
  service: string;
  stylist?: string | null;
  assistant?: string | null;
  technical?: any;
  rating?: number | null;
  followUpNotes?: string | null;
}

interface GeneratedTag {
  tag: string;
  category: string;
}

/**
 * Generate tags based on customer data and visits
 */
export function generateTags(
  customer: Customer,
  visits: Visit[]
): GeneratedTag[] {
  const tags: GeneratedTag[] = [];

  // ============================================
  // 1) BEHAVIOR TAGS
  // ============================================
  if (customer.totalVisits <= 1) {
    tags.push({ tag: "New Customer", category: "behavior" });
  }

  if (customer.totalVisits >= 2) {
    tags.push({ tag: "Returning Customer", category: "behavior" });
  }

  // Check 6 months spent
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentVisits = visits.filter(
    (v) => new Date(v.date) >= sixMonthsAgo
  );
  const sixMonthSpent = recentVisits.reduce(
    (sum, v) => sum + (v.totalCharge || 0),
    0
  );

  if (customer.totalSpent > 20_000_000 || sixMonthSpent > 8_000_000) {
    tags.push({ tag: "VIP", category: "behavior" });
  } else if (customer.totalSpent > 8_000_000 || sixMonthSpent > 5_000_000) {
    tags.push({ tag: "High Value", category: "behavior" });
  } else if (customer.totalSpent < 2_000_000) {
    tags.push({ tag: "Low Value", category: "behavior" });
  }

  // ============================================
  // 2) VISIT FREQUENCY TAGS
  // ============================================
  if (visits.length === 0) {
    tags.push({ tag: "No Visit History", category: "frequency" });
  } else {
    const lastVisit = visits[0];
    const daysSince =
      (Date.now() - new Date(lastVisit.date).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysSince <= 30) {
      tags.push({ tag: "Active", category: "frequency" });
    } else if (daysSince <= 60) {
      tags.push({ tag: "Warm", category: "frequency" });
    } else if (daysSince <= 90) {
      tags.push({ tag: "Cold", category: "frequency" });
    } else if (daysSince <= 180) {
      tags.push({ tag: "Overdue", category: "frequency" });
    } else {
      tags.push({ tag: "Lost", category: "frequency" });
    }
  }

  // ============================================
  // 3) TECHNICAL PROFILE TAGS
  // ============================================
  const lastVisit = visits[0];
  if (lastVisit?.technical) {
    const tech = lastVisit.technical;

    // Check chem history
    const chemHistory =
      typeof tech.chemHistory12Months === "string"
        ? tech.chemHistory12Months.toLowerCase()
        : "";
    if (
      chemHistory.includes("tẩy") ||
      chemHistory.includes("bleach") ||
      chemHistory.includes("tẩy màu")
    ) {
      tags.push({ tag: "Bleached Hair", category: "technical" });
    }

    // Check warnings
    if (
      tech.warnings &&
      Array.isArray(tech.warnings) &&
      tech.warnings.length > 0
    ) {
      tags.push({ tag: "Risky Hair", category: "technical" });
    }

    // Check hair condition
    if (tech.hairCondition) {
      const breakageRisk = tech.hairCondition.breakageRisk;
      if (breakageRisk === "HIGH") {
        tags.push({ tag: "High-Damage History", category: "technical" });
      }

      const porosity = tech.hairCondition.porosity;
      if (porosity === "high") {
        tags.push({ tag: "Sensitive Scalp", category: "technical" });
      }
    }

    // Check heavily processed
    let processCount = 0;
    visits.forEach((v) => {
      if (v.technical?.chemHistory12Months) processCount++;
      if (v.service.includes("Uốn")) processCount++;
      if (v.service.includes("Nhuộm")) processCount++;
    });
    if (processCount >= 5) {
      tags.push({ tag: "Heavily Processed", category: "technical" });
    }
  }

  // Natural hair check (no technical records)
  if (
    visits.length > 0 &&
    !visits.some((v) => v.technical && Object.keys(v.technical).length > 0)
  ) {
    tags.push({ tag: "Natural Hair", category: "technical" });
  }

  // ============================================
  // 4) SERVICE PREFERENCE TAGS
  // ============================================
  const serviceCount: Record<string, number> = {};
  visits.forEach((v) => {
    const service = v.service.toLowerCase();
    if (service.includes("uốn")) {
      serviceCount["Uốn"] = (serviceCount["Uốn"] || 0) + 1;
    }
    if (service.includes("nhuộm")) {
      serviceCount["Nhuộm"] = (serviceCount["Nhuộm"] || 0) + 1;
    }
    if (service.includes("phục hồi")) {
      serviceCount["Phục hồi"] = (serviceCount["Phục hồi"] || 0) + 1;
    }
    if (
      service.includes("cắt") &&
      !service.includes("uốn") &&
      !service.includes("nhuộm")
    ) {
      serviceCount["Cắt"] = (serviceCount["Cắt"] || 0) + 1;
    }
  });

  if (serviceCount["Uốn"] >= 2) {
    tags.push({ tag: "Hay uốn", category: "service" });
  }
  if (serviceCount["Nhuộm"] >= 2) {
    tags.push({ tag: "Hay nhuộm", category: "service" });
  }
  if (serviceCount["Phục hồi"] >= 2) {
    tags.push({ tag: "Hay phục hồi", category: "service" });
  }
  if (
    serviceCount["Cắt"] >= 2 &&
    Object.keys(serviceCount).filter((k) => k !== "Cắt").length === 0
  ) {
    tags.push({ tag: "Chỉ cắt", category: "service" });
  }

  // Style preferences (from visit notes/service names)
  visits.forEach((v) => {
    const service = v.service.toLowerCase();
    if (service.includes("hàn") || service.includes("hàn quốc")) {
      tags.push({ tag: "Thích style Hàn", category: "service" });
    }
    if (service.includes("nâu") || service.includes("brown")) {
      tags.push({ tag: "Thích màu nâu lạnh", category: "service" });
    }
    if (
      service.includes("sáng") ||
      service.includes("blonde") ||
      service.includes("vàng")
    ) {
      tags.push({ tag: "Thích màu sáng", category: "service" });
    }
  });

  // ============================================
  // 5) COMPLAINT TAGS
  // ============================================
  const hasComplaint = visits.some((v) => {
    const notes = (v.followUpNotes || "").toLowerCase();
    const visitNotes = (v.notes || "").toLowerCase();
    return (
      notes.includes("không ưng") ||
      notes.includes("không hài lòng") ||
      notes.includes("phàn nàn") ||
      visitNotes.includes("làm lại") ||
      (v.rating && v.rating <= 2)
    );
  });

  if (hasComplaint) {
    tags.push({ tag: "Complaint History", category: "complaint" });
  }

  const hasRedo = visits.some(
    (v) =>
      (v.notes || "").toLowerCase().includes("làm lại") ||
      (v.followUpNotes || "").toLowerCase().includes("làm lại")
  );

  if (hasRedo) {
    tags.push({ tag: "Redo Case", category: "complaint" });
  }

  const recentNotSatisfied = visits
    .slice(0, 3)
    .some(
      (v) =>
        (v.rating && v.rating <= 2) ||
        (v.followUpNotes || "").toLowerCase().includes("không ưng")
    );

  if (recentNotSatisfied) {
    tags.push({ tag: "Not satisfied (recent)", category: "complaint" });
  }

  // ============================================
  // 6) STYLIST RELATION TAGS
  // ============================================
  const stylistCount: Record<string, number> = {};
  visits.forEach((v) => {
    if (v.stylist) {
      stylistCount[v.stylist] = (stylistCount[v.stylist] || 0) + 1;
    }
  });

  const topStylist = Object.entries(stylistCount).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (topStylist && topStylist[1] >= 2) {
    tags.push({
      tag: `Preferred: ${topStylist[0]}`,
      category: "stylist",
    });
  }

  // ============================================
  // REMOVE DUPLICATES
  // ============================================
  const uniqueTags: GeneratedTag[] = [];
  const seen = new Set<string>();

  tags.forEach((t) => {
    if (!seen.has(t.tag)) {
      seen.add(t.tag);
      uniqueTags.push(t);
    }
  });

  return uniqueTags;
}

/**
 * Get segmentation group based on tags
 */
export function getSegmentationGroup(tags: GeneratedTag[]): string {
  const tagStrings = tags.map((t) => t.tag);

  // Group A: VIP High Value
  if (
    tagStrings.includes("VIP") &&
    (tagStrings.includes("High Value") || tagStrings.includes("Active"))
  ) {
    return "A";
  }

  // Group B: Ready-to-Return
  if (
    tagStrings.includes("Warm") ||
    tagStrings.includes("Cold") ||
    tagStrings.includes("Active")
  ) {
    return "B";
  }

  // Group C: Overdue 90-180 days
  if (tagStrings.includes("Overdue")) {
    return "C";
  }

  // Group D: Lost 180+ days
  if (tagStrings.includes("Lost")) {
    return "D";
  }

  // Group E: High Risk Hair
  if (
    tagStrings.includes("Risky Hair") ||
    tagStrings.includes("High-Damage History") ||
    tagStrings.includes("Bleached Hair")
  ) {
    return "E";
  }

  // Group F: Color Lovers
  if (
    tagStrings.includes("Hay nhuộm") ||
    tagStrings.includes("Thích màu nâu lạnh") ||
    tagStrings.includes("Thích màu sáng")
  ) {
    return "F";
  }

  // Group G: Curl Lovers
  if (tagStrings.includes("Hay uốn")) {
    return "G";
  }

  // Default
  return "H";
}

