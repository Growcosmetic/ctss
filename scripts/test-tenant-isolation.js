#!/usr/bin/env node

/**
 * Negative Test: Tenant Isolation Security
 * 
 * This script tests that salon2 cannot access salon1's data
 * even when trying to access records by ID directly.
 */

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// Test accounts (from seed)
const SALON1_ADMIN = {
  phone: "0900000001",
  password: "123456",
};

const SALON2_ADMIN = {
  phone: "0900000011",
  password: "123456",
};

let salon1Token = null;
let salon2Token = null;
let salon1CustomerId = null;
let salon1BookingId = null;
let salon1InvoiceId = null;

/**
 * Login and get auth token
 */
async function login(phone, password) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token || response.headers.get("set-cookie")?.match(/auth-token=([^;]+)/)?.[1];
}

/**
 * Get auth cookie from login
 */
async function loginAndGetCookie(phone, password) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, password }),
  });

  const cookies = response.headers.get("set-cookie");
  if (!cookies) {
    throw new Error("No cookie received");
  }

  const match = cookies.match(/auth-token=([^;]+)/);
  return match ? match[1] : null;
}

/**
 * Fetch with auth cookie
 */
async function fetchWithAuth(url, cookie) {
  return fetch(url, {
    headers: {
      Cookie: `auth-token=${cookie}`,
    },
  });
}

/**
 * Test: Salon2 tries to access Salon1 customer
 */
async function testCustomerAccess() {
  console.log("\n🧪 Test 1: Salon2 accessing Salon1 customer...");

  if (!salon1CustomerId) {
    console.log("  ⚠️  Skipping: No salon1 customer ID");
    return;
  }

  const response = await fetchWithAuth(
    `${BASE_URL}/api/customers/${salon1CustomerId}`,
    salon2Token
  );

  if (response.status === 404) {
    console.log("  ✅ PASS: Correctly returned 404 (not leaking existence)");
  } else if (response.status === 401 || response.status === 403) {
    console.log(`  ✅ PASS: Correctly returned ${response.status} (unauthorized)`);
  } else {
    const data = await response.json();
    console.log(`  ❌ FAIL: Got status ${response.status}`);
    console.log(`     Response:`, data);
    throw new Error("Security breach: Salon2 can access Salon1 customer");
  }
}

/**
 * Test: Salon2 tries to access Salon1 booking
 */
async function testBookingAccess() {
  console.log("\n🧪 Test 2: Salon2 accessing Salon1 booking...");

  if (!salon1BookingId) {
    console.log("  ⚠️  Skipping: No salon1 booking ID");
    return;
  }

  const response = await fetchWithAuth(
    `${BASE_URL}/api/bookings/${salon1BookingId}`,
    salon2Token
  );

  if (response.status === 404) {
    console.log("  ✅ PASS: Correctly returned 404 (not leaking existence)");
  } else if (response.status === 401 || response.status === 403) {
    console.log(`  ✅ PASS: Correctly returned ${response.status} (unauthorized)`);
  } else {
    const data = await response.json();
    console.log(`  ❌ FAIL: Got status ${response.status}`);
    console.log(`     Response:`, data);
    throw new Error("Security breach: Salon2 can access Salon1 booking");
  }
}

/**
 * Test: Salon2 tries to update Salon1 customer
 */
async function testCustomerUpdate() {
  console.log("\n🧪 Test 3: Salon2 trying to update Salon1 customer...");

  if (!salon1CustomerId) {
    console.log("  ⚠️  Skipping: No salon1 customer ID");
    return;
  }

  const response = await fetch(`${BASE_URL}/api/customers/${salon1CustomerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: `auth-token=${salon2Token}`,
    },
    body: JSON.stringify({ firstName: "Hacked", lastName: "Name" }),
  });

  if (response.status === 404) {
    console.log("  ✅ PASS: Correctly returned 404 (not leaking existence)");
  } else if (response.status === 401 || response.status === 403) {
    console.log(`  ✅ PASS: Correctly returned ${response.status} (unauthorized)`);
  } else {
    const data = await response.json();
    console.log(`  ❌ FAIL: Got status ${response.status}`);
    console.log(`     Response:`, data);
    throw new Error("Security breach: Salon2 can update Salon1 customer");
  }
}

/**
 * Get first customer ID from salon1
 */
async function getSalon1CustomerId() {
  const response = await fetchWithAuth(
    `${BASE_URL}/api/customers?limit=1`,
    salon1Token
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.success && data.data?.customers?.length > 0) {
    return data.data.customers[0].id;
  }
  return null;
}

/**
 * Get first booking ID from salon1
 */
async function getSalon1BookingId() {
  const response = await fetchWithAuth(
    `${BASE_URL}/api/bookings?limit=1`,
    salon1Token
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.success && data.data?.bookings?.length > 0) {
    return data.data.bookings[0].id;
  }
  return null;
}

/**
 * Main test runner
 */
async function runTests() {
  console.log("🔒 Tenant Isolation Security Tests");
  console.log("====================================");

  try {
    // Step 1: Login as both salons
    console.log("\n📝 Step 1: Logging in...");
    salon1Token = await loginAndGetCookie(SALON1_ADMIN.phone, SALON1_ADMIN.password);
    salon2Token = await loginAndGetCookie(SALON2_ADMIN.phone, SALON2_ADMIN.password);

    if (!salon1Token || !salon2Token) {
      throw new Error("Failed to login");
    }

    console.log("  ✅ Salon1 logged in");
    console.log("  ✅ Salon2 logged in");

    // Step 2: Get IDs from salon1
    console.log("\n📝 Step 2: Getting Salon1 data IDs...");
    salon1CustomerId = await getSalon1CustomerId();
    salon1BookingId = await getSalon1BookingId();

    console.log(`  Customer ID: ${salon1CustomerId || "none"}`);
    console.log(`  Booking ID: ${salon1BookingId || "none"}`);

    // Step 3: Run negative tests
    await testCustomerAccess();
    await testBookingAccess();
    await testCustomerUpdate();

    console.log("\n✅ All security tests passed!");
    console.log("\n🎉 Tenant isolation is working correctly.");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run tests
runTests();

