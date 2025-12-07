// ============================================
// Reminder Rules Engine - Auto Generate Reminders
// ============================================

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalVisits: number;
  totalSpent: number;
}

interface Visit {
  id: string;
  date: Date;
  service: string;
  stylist?: string | null;
  rating?: number | null;
}

interface Reminder {
  type: string;
  sendAt: Date;
  message: string;
  channel?: string;
  metadata?: any;
}

/**
 * Generate reminders based on customer data, visits, and tags
 */
export function generateReminders(
  customer: Customer,
  visits: Visit[],
  tags: string[]
): Reminder[] {
  const reminders: Reminder[] = [];

  if (visits.length === 0) {
    return reminders;
  }

  const lastVisit = visits[0];
  const lastVisitDate = new Date(lastVisit.date);
  const now = new Date();
  const daysSince = Math.floor(
    (now.getTime() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // ============================================
  // 1) FOLLOW-UP 24H (sau khi làm tóc)
  // ============================================
  if (daysSince <= 1) {
    // Gửi sau 24h từ lần visit gần nhất
    const sendAt = new Date(lastVisitDate);
    sendAt.setHours(sendAt.getHours() + 24);

    reminders.push({
      type: "followup",
      sendAt,
      message: `Dạ em chào chị ${customer.name}! Chị yêu 💛

Hôm qua chị có làm ${lastVisit.service} bên em. Không biết hôm nay tóc chị vào nếp ok không ạ?

Nếu có gì chưa ưng ý hoặc cần em tư vấn thêm, cứ nhắn em nha. Em luôn sẵn sàng hỗ trợ chị ❤️`,
      channel: "zalo",
    });
  }

  // ============================================
  // 2) REBOOK CURL (6-8 tuần cho khách hay uốn)
  // ============================================
  if (tags.includes("Hay uốn") && lastVisit.service.toLowerCase().includes("uốn")) {
    // Gửi sau 45 ngày (6.5 tuần)
    const sendAt = new Date(lastVisitDate);
    sendAt.setDate(sendAt.getDate() + 45);

    if (sendAt > now) {
      reminders.push({
        type: "rebook_curl",
        sendAt,
        message: `Dạ em chào chị ${customer.name}! 💛

Chị ơi đã gần 6 tuần từ lần uốn gần nhất của chị rồi nè. Đây là thời điểm đẹp nhất để mình chỉnh nếp lại, giúp tóc vào nếp đều và đẹp hơn ạ.

Chị muốn em giữ lịch đẹp cho lần này không ạ? Em có thể sắp xếp cho chị vào khung giờ phù hợp nhất ❤️`,
        channel: "zalo",
      });
    }
  }

  // ============================================
  // 3) RECOLOR (4-6 tuần cho khách hay nhuộm)
  // ============================================
  if (tags.includes("Hay nhuộm") && lastVisit.service.toLowerCase().includes("nhuộm")) {
    // Gửi sau 35 ngày (5 tuần)
    const sendAt = new Date(lastVisitDate);
    sendAt.setDate(sendAt.getDate() + 35);

    if (sendAt > now) {
      reminders.push({
        type: "recolor",
        sendAt,
        message: `Dạ em chào chị ${customer.name}! 💛

Chị ơi phần chân tóc mình mọc mới rồi nè. Để màu đẹp đều và không bị 2 tone, mình nên dặm lại màu cho chân tóc nha chị.

Chị muốn em giữ lịch cho lần này không ạ? Em sắp xếp lịch đẹp cho chị ❤️`,
        channel: "zalo",
      });
    }
  }

  // ============================================
  // 4) RECOVERY (2-3 tuần cho khách High Risk)
  // ============================================
  if (
    (tags.includes("Risky Hair") ||
      tags.includes("High-Damage History") ||
      tags.includes("Bleached Hair")) &&
    daysSince >= 14 &&
    daysSince <= 21
  ) {
    const sendAt = new Date(now);
    sendAt.setDate(sendAt.getDate() + 1); // Gửi ngày mai

    reminders.push({
      type: "recovery",
      sendAt,
      message: `Dạ em chào chị ${customer.name}! 💛

Để tóc chắc khỏe hơn, chị nên qua em phục hồi nhẹ 20 phút trong tuần này nha. Treatment phục hồi sẽ giúp tóc mình đàn hồi tốt hơn và giảm hư tổn ạ.

Chị muốn em giữ lịch không ạ? ❤️`,
      channel: "zalo",
    });
  }

  // ============================================
  // 5) OVERDUE (90-180 ngày)
  // ============================================
  if (tags.includes("Overdue") && daysSince >= 90 && daysSince <= 180) {
    const sendAt = new Date(now);
    sendAt.setHours(sendAt.getHours() + 2); // Gửi sau 2 giờ

    reminders.push({
      type: "overdue",
      sendAt,
      message: `Dạ em chào chị ${customer.name}! 💛

Chị ơi lâu rồi mình chưa ghé salon em nè. Em nhớ chị lắm!

Bên em có ưu đãi nhẹ cho khách thân, chị muốn em gửi chi tiết không ạ? Hoặc chị muốn em giữ lịch đẹp cho lần này cũng được nha ❤️`,
      channel: "zalo",
    });
  }

  // ============================================
  // 6) LOST (180+ ngày)
  // ============================================
  if (tags.includes("Lost") && daysSince > 180) {
    const sendAt = new Date(now);
    sendAt.setHours(sendAt.getHours() + 3); // Gửi sau 3 giờ

    reminders.push({
      type: "overdue",
      sendAt,
      message: `Dạ em chào chị ${customer.name}! 💛

Em nhớ chị lắm! Đã lâu rồi em chưa được gặp chị.

Bên em có chương trình đặc biệt cho khách thân quay lại, chị muốn em gửi chi tiết không ạ? Em sẽ giữ lịch đẹp nhất cho chị nha ❤️`,
      channel: "zalo",
    });
  }

  // ============================================
  // 7) APPOINTMENT REMINDER (12-24h trước lịch)
  // ============================================
  // Note: This will be handled separately when booking is created
  // This is a placeholder structure

  return reminders;
}

/**
 * Generate appointment reminder (before booking date)
 */
export function generateAppointmentReminder(
  customerName: string,
  appointmentDate: Date,
  service: string,
  stylist?: string
): Reminder {
  // Gửi 18 giờ trước lịch hẹn
  const sendAt = new Date(appointmentDate);
  sendAt.setHours(sendAt.getHours() - 18);

  return {
    type: "appointment",
    sendAt,
    message: `Dạ em chào chị ${customerName}! 💛

Em nhắc nhẹ chị lịch làm ${service} ngày mai lúc ${appointmentDate.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} nè chị.

Stylist ${stylist || "Chí Tâm"} sẽ làm cho mình nha. Em hẹn gặp chị ngày mai ạ ❤️`,
    channel: "zalo",
  };
}

