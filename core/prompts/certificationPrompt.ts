// ============================================
// Certification Prompt - AI tạo nội dung chứng chỉ
// ============================================

export function certificationPrompt(
  staffName: string,
  levelName: string,
  role: string,
  averageScore: number,
  issueDate: string
): string {
  return `
Bạn là AI Certificate Generator cho Chí Tâm Hair Salon.

Tạo nội dung chứng chỉ đào tạo với thông tin:

Tên nhân viên: ${staffName}
Cấp độ: ${levelName}
Vai trò: ${role}
Điểm trung bình: ${averageScore}/100
Ngày cấp: ${issueDate}

Yêu cầu:
- Văn phong sang trọng, trang trọng
- Phù hợp với văn hóa salon Việt Nam
- Ngắn gọn nhưng đầy đủ
- Có tính chuyên nghiệp

Trả về JSON:

{
  "title": "Tiêu đề chứng chỉ",
  "content": "Nội dung chứng chỉ (2-3 câu)",
  "signature": "Tên người ký (Huỳnh Chí Tâm)",
  "footer": "Footer text (nếu có)"
}

CHỈ TRẢ VỀ JSON - KHÔNG DÙNG MARKDOWN.
  `;
}

