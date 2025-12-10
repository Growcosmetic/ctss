// ============================================
// SEED DATA - Dữ liệu mẫu cho CTSS
// File này có thể chỉnh sửa để thay đổi dữ liệu seed
// ============================================

module.exports = {
  // ============================================
  // USERS - Người dùng hệ thống
  // ============================================
  users: [
    {
      name: "Admin User",
      phone: "0900000001",
      password: "123456",
      role: "ADMIN",
    },
    {
      name: "Manager User",
      phone: "0900000002",
      password: "123456",
      role: "MANAGER",
    },
    {
      name: "Reception User",
      phone: "0900000003",
      password: "123456",
      role: "RECEPTIONIST",
    },
    {
      name: "Stylist User",
      phone: "0900000004",
      password: "123456",
      role: "STYLIST",
    },
    {
      name: "Assistant User",
      phone: "0900000005",
      password: "123456",
      role: "ASSISTANT",
    },
  ],

  // ============================================
  // CUSTOMER GROUPS - Nhóm khách hàng
  // ============================================
  customerGroups: [
    "Khách hàng VIP",
    "Khách hàng Thân thiết",
    "Khách hàng Mới",
    "Khách hàng Tiềm năng",
    "Khách hàng Thường xuyên",
  ],

  // ============================================
  // CUSTOMERS - Khách hàng
  // ============================================
  customers: [
    {
      firstName: "Nguyễn",
      lastName: "Văn An",
      phone: "0901234567",
      email: "nguyenvanan@example.com",
      dateOfBirth: "1990-05-15",
      gender: "MALE",
      address: "123 Đường Nguyễn Huệ, Quận 1",
      city: "Quận 1",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng VIP, chi tiêu cao",
      preferences: {
        customerGroup: "Khách hàng VIP",
        rank: "Hạng Vàng",
      },
    },
    {
      firstName: "Trần",
      lastName: "Thị Bình",
      phone: "0902345678",
      email: "tranthibinh@example.com",
      dateOfBirth: "1992-08-20",
      gender: "FEMALE",
      address: "456 Đường Lê Lợi, Quận 3",
      city: "Quận 3",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng thân thiết, đến đều đặn",
      preferences: {
        customerGroup: "Khách hàng Thân thiết",
        rank: "Hạng Bạc",
      },
    },
    {
      firstName: "Lê",
      lastName: "Văn Cường",
      phone: "0903456789",
      email: "levancuong@example.com",
      dateOfBirth: "1988-12-10",
      gender: "MALE",
      address: "789 Đường Pasteur, Quận 1",
      city: "Quận 1",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng mới, cần chăm sóc",
      preferences: {
        customerGroup: "Khách hàng Mới",
        rank: "Hạng Thường",
      },
    },
    {
      firstName: "Phạm",
      lastName: "Thị Dung",
      phone: "0904567890",
      email: "phamthidung@example.com",
      dateOfBirth: "1995-03-25",
      gender: "FEMALE",
      address: "321 Đường Điện Biên Phủ, Quận Bình Thạnh",
      city: "Quận Bình Thạnh",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng thường xuyên",
      preferences: {
        customerGroup: "Khách hàng Thường xuyên",
        rank: "Hạng Bạc",
      },
    },
    {
      firstName: "Hoàng",
      lastName: "Văn Em",
      phone: "0905678901",
      email: "hoangvanem@example.com",
      dateOfBirth: "1991-07-18",
      gender: "MALE",
      address: "654 Đường Võ Văn Tần, Quận 3",
      city: "Quận 3",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng VIP cao cấp",
      preferences: {
        customerGroup: "Khách hàng VIP",
        rank: "Hạng Vàng",
      },
    },
    {
      firstName: "Võ",
      lastName: "Thị Phương",
      phone: "0906789012",
      email: "vothiphuong@example.com",
      dateOfBirth: "1993-11-05",
      gender: "FEMALE",
      address: "987 Đường Nguyễn Đình Chiểu, Quận 3",
      city: "Quận 3",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng thân thiết",
      preferences: {
        customerGroup: "Khách hàng Thân thiết",
        rank: "Hạng Bạc",
      },
    },
    {
      firstName: "Đặng",
      lastName: "Văn Giang",
      phone: "0907890123",
      email: "dangvangiang@example.com",
      dateOfBirth: "1989-09-30",
      gender: "MALE",
      address: "147 Đường Nam Kỳ Khởi Nghĩa, Quận 1",
      city: "Quận 1",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng mới",
      preferences: {
        customerGroup: "Khách hàng Mới",
        rank: "Hạng Thường",
      },
    },
    {
      firstName: "Bùi",
      lastName: "Thị Hoa",
      phone: "0908901234",
      email: "buithihoa@example.com",
      dateOfBirth: "1994-04-12",
      gender: "FEMALE",
      address: "258 Đường Cách Mạng Tháng 8, Quận 10",
      city: "Quận 10",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng thường xuyên",
      preferences: {
        customerGroup: "Khách hàng Thường xuyên",
        rank: "Hạng Thường",
      },
    },
    {
      firstName: "Ngô",
      lastName: "Văn Ích",
      phone: "0909012345",
      email: "ngovanich@example.com",
      dateOfBirth: "1990-01-22",
      gender: "MALE",
      address: "369 Đường Lý Tự Trọng, Quận 1",
      city: "Quận 1",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng VIP cao cấp",
      preferences: {
        customerGroup: "Khách hàng VIP",
        rank: "Hạng Vàng",
      },
    },
    {
      firstName: "Đỗ",
      lastName: "Thị Kim",
      phone: "0900123456",
      email: "dothikim@example.com",
      dateOfBirth: "1992-06-08",
      gender: "FEMALE",
      address: "741 Đường Trần Hưng Đạo, Quận 5",
      city: "Quận 5",
      province: "TP Hồ Chí Minh",
      notes: "Khách hàng thân thiết",
      preferences: {
        customerGroup: "Khách hàng Thân thiết",
        rank: "Hạng Bạc",
      },
    },
  ],

  // ============================================
  // SERVICES - Dịch vụ
  // ============================================
  services: [
    {
      name: "Cắt tóc nam",
      category: "Cắt tóc",
      price: 100000,
      duration: 30,
    },
    {
      name: "Cắt tóc nữ",
      category: "Cắt tóc",
      price: 150000,
      duration: 45,
    },
    {
      name: "Uốn tóc",
      category: "Uốn",
      price: 500000,
      duration: 180,
    },
    {
      name: "Nhuộm tóc",
      category: "Nhuộm",
      price: 600000,
      duration: 120,
    },
    {
      name: "Duỗi tóc",
      category: "Duỗi",
      price: 400000,
      duration: 150,
    },
    {
      name: "Gội đầu",
      category: "Chăm sóc",
      price: 80000,
      duration: 20,
    },
    {
      name: "Massage da đầu",
      category: "Chăm sóc",
      price: 120000,
      duration: 30,
    },
    {
      name: "Tạo kiểu",
      category: "Tạo kiểu",
      price: 200000,
      duration: 60,
    },
  ],

  // ============================================
  // PRODUCTS - Sản phẩm
  // ============================================
  products: [
    {
      name: "Thuốc nhuộm L'Oreal",
      category: "Hóa chất",
      subCategory: "Nhuộm",
      unit: "Chai",
      pricePerUnit: 250000,
      stock: 50,
      minStock: 10,
      maxStock: 100,
      supplier: "L'Oreal Vietnam",
    },
    {
      name: "Thuốc uốn Plexis",
      category: "Hóa chất",
      subCategory: "Uốn",
      unit: "Chai",
      pricePerUnit: 300000,
      stock: 30,
      minStock: 5,
      maxStock: 50,
      supplier: "Plexis",
    },
    {
      name: "Dầu gội Kerastase",
      category: "Chăm sóc",
      subCategory: "Dầu gội",
      unit: "Chai",
      pricePerUnit: 450000,
      stock: 40,
      minStock: 10,
      maxStock: 80,
      supplier: "Kerastase",
    },
    {
      name: "Dầu xả Kerastase",
      category: "Chăm sóc",
      subCategory: "Dầu xả",
      unit: "Chai",
      pricePerUnit: 450000,
      stock: 40,
      minStock: 10,
      maxStock: 80,
      supplier: "Kerastase",
    },
    {
      name: "Mặt nạ tóc Olaplex",
      category: "Chăm sóc",
      subCategory: "Treatment",
      unit: "Gói",
      pricePerUnit: 200000,
      stock: 60,
      minStock: 20,
      maxStock: 100,
      supplier: "Olaplex",
    },
    {
      name: "Thuốc duỗi Goldwell",
      category: "Hóa chất",
      subCategory: "Duỗi",
      unit: "Chai",
      pricePerUnit: 350000,
      stock: 25,
      minStock: 5,
      maxStock: 40,
      supplier: "Goldwell",
    },
  ],

  // ============================================
  // BRANCHES - Chi nhánh
  // ============================================
  branches: [
    {
      name: "Chi nhánh Quận 1",
      address: "123 Đường Nguyễn Huệ, Quận 1, TP Hồ Chí Minh",
      phone: "0281234567",
      email: "q1@chitamsalon.com",
    },
    {
      name: "Chi nhánh Quận 3",
      address: "456 Đường Lê Lợi, Quận 3, TP Hồ Chí Minh",
      phone: "0282345678",
      email: "q3@chitamsalon.com",
    },
  ],
};

