// ============================================
// SEED TOÀN BỘ HỆ THỐNG QUA API
// Chạy: node scripts/seed-all-via-api.js
// Yêu cầu: Dev server phải đang chạy (npm run dev)
// ============================================

const seedData = require('../data/seed-data');
const baseUrl = process.env.API_URL || 'http://localhost:3000';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function createGroup(groupName) {
  try {
    const response = await fetch(`${baseUrl}/api/crm/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ groupName }),
    });
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Group: ${groupName}`);
      return true;
    } else if (result.error?.includes('already exists')) {
      console.log(`⏭️  Group đã tồn tại: ${groupName}`);
      return true;
    }
    console.log(`⚠️  Group ${groupName}: ${result.error || 'Unknown error'}`);
    return false;
  } catch (error) {
    console.error(`❌ Lỗi tạo group ${groupName}:`, error.message);
    return false;
  }
}

async function createCustomer(customerData) {
  try {
    const response = await fetch(`${baseUrl}/api/crm/customer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customerData),
    });
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Customer: ${customerData.firstName} ${customerData.lastName}`);
      return true;
    } else if (result.error?.includes('already exists') || result.error?.includes('đã được sử dụng')) {
      console.log(`⏭️  Customer đã tồn tại: ${customerData.firstName} ${customerData.lastName}`);
      return true;
    }
    console.log(`⚠️  Customer ${customerData.firstName} ${customerData.lastName}: ${result.error || 'Unknown error'}`);
    return false;
  } catch (error) {
    console.error(`❌ Lỗi tạo customer ${customerData.firstName} ${customerData.lastName}:`, error.message);
    return false;
  }
}

async function createService(serviceData) {
  try {
    const response = await fetch(`${baseUrl}/api/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serviceData),
    });
    
    if (!response.ok) {
      const text = await response.text();
      console.log(`⚠️  Service ${serviceData.name}: HTTP ${response.status} - ${text.substring(0, 100)}`);
      return false;
    }
    
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Service: ${serviceData.name}`);
      return true;
    } else if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
      console.log(`⏭️  Service đã tồn tại: ${serviceData.name}`);
      return true;
    }
    console.log(`⚠️  Service ${serviceData.name}: ${result.error || 'Unknown error'}`);
    return false;
  } catch (error) {
    console.error(`❌ Lỗi tạo service ${serviceData.name}:`, error.message);
    return false;
  }
}

async function createProduct(productData) {
  try {
    const response = await fetch(`${baseUrl}/api/inventory/product/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Product: ${productData.name}`);
      return true;
    } else if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
      console.log(`⏭️  Product đã tồn tại: ${productData.name}`);
      return true;
    }
    console.log(`⚠️  Product ${productData.name}: ${result.error || 'Unknown error'}`);
    return false;
  } catch (error) {
    console.error(`❌ Lỗi tạo product ${productData.name}:`, error.message);
    return false;
  }
}

async function createBranch(branchData) {
  try {
    const response = await fetch(`${baseUrl}/api/branches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(branchData),
    });
    const result = await response.json();
    if (result.success) {
      console.log(`✅ Branch: ${branchData.name}`);
      return true;
    } else if (result.error?.includes('already exists') || result.error?.includes('duplicate')) {
      console.log(`⏭️  Branch đã tồn tại: ${branchData.name}`);
      return true;
    }
    console.log(`⚠️  Branch ${branchData.name}: ${result.error || 'Unknown error'}`);
    return false;
  } catch (error) {
    console.error(`❌ Lỗi tạo branch ${branchData.name}:`, error.message);
    return false;
  }
}

// ============================================
// MAIN SEED FUNCTION
// ============================================

async function main() {
  console.log("🚀 Bắt đầu seed toàn bộ hệ thống qua API...\n");
  console.log(`📡 Kết nối đến: ${baseUrl}\n`);

  // Kiểm tra server
  try {
    await fetch(`${baseUrl}/api/health`).catch(() => null);
  } catch (error) {
    console.log("⚠️  Không thể kết nối đến server!");
    console.log("💡 Hãy chạy: npm run dev");
    process.exit(1);
  }

  let stats = {
    groups: { created: 0, skipped: 0 },
    customers: { created: 0, skipped: 0 },
    services: { created: 0, skipped: 0 },
    products: { created: 0, skipped: 0 },
    branches: { created: 0, skipped: 0 },
  };

  // 1. Seed Groups
  console.log("📁 Tạo customer groups...\n");
  for (const groupName of seedData.customerGroups) {
    const success = await createGroup(groupName);
    if (success) stats.groups.created++;
    else stats.groups.skipped++;
    await sleep(200);
  }

  // 2. Seed Customers
  console.log("\n👤 Tạo customers...\n");
  for (const customerData of seedData.customers) {
    const success = await createCustomer(customerData);
    if (success) stats.customers.created++;
    else stats.customers.skipped++;
    await sleep(300);
  }

  // 3. Seed Services
  console.log("\n💇 Tạo services...\n");
  for (const serviceData of seedData.services) {
    const success = await createService(serviceData);
    if (success) stats.services.created++;
    else stats.services.skipped++;
    await sleep(200);
  }

  // 4. Seed Products
  console.log("\n📦 Tạo products...\n");
  for (const productData of seedData.products) {
    const success = await createProduct(productData);
    if (success) stats.products.created++;
    else stats.products.skipped++;
    await sleep(200);
  }

  // 5. Seed Branches
  console.log("\n🏢 Tạo branches...\n");
  for (const branchData of seedData.branches) {
    const success = await createBranch(branchData);
    if (success) stats.branches.created++;
    else stats.branches.skipped++;
    await sleep(200);
  }

  // Tổng kết
  console.log("\n✨ Hoàn thành seed toàn bộ hệ thống!");
  console.log("\n📊 Tổng kết:");
  console.log(`   📁 Groups: ${stats.groups.created} tạo, ${stats.groups.skipped} đã tồn tại`);
  console.log(`   👤 Customers: ${stats.customers.created} tạo, ${stats.customers.skipped} đã tồn tại`);
  console.log(`   💇 Services: ${stats.services.created} tạo, ${stats.services.skipped} đã tồn tại`);
  console.log(`   📦 Products: ${stats.products.created} tạo, ${stats.products.skipped} đã tồn tại`);
  console.log(`   🏢 Branches: ${stats.branches.created} tạo, ${stats.branches.skipped} đã tồn tại`);
  
  console.log("\n🔑 Đăng nhập:");
  console.log("   - Phone: 0900000001 | Password: 123456 (ADMIN)");
  console.log("   - Phone: 0900000002 | Password: 123456 (MANAGER)");
  console.log("   - Phone: 0900000003 | Password: 123456 (RECEPTIONIST)");
  
  console.log("\n🌐 Truy cập:");
  console.log("   - CRM: http://localhost:3000/crm");
  console.log("   - Booking: http://localhost:3000/booking");
  console.log("   - Services: http://localhost:3000/services");
  console.log("   - Inventory: http://localhost:3000/inventory");
}

main().catch((error) => {
  console.error("❌ Lỗi:", error);
  process.exit(1);
});

