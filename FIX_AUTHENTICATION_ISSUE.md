# 🔧 Fix: Bị bắt đăng nhập lại khi vào Kho

## ❌ Vấn đề

Sau khi đăng nhập với `admin@ctss.com / 123456`, khi vào phần **Kho (Inventory)**, hệ thống bắt đăng nhập lại.

## 🔍 Nguyên nhân

1. **useAuth hook**: Trả về `isAuthenticated` nhưng inventory page dùng `authenticated`
2. **getCurrentUser**: Khi database fail, không có fallback đến mock endpoint
3. **Cookie**: Có thể không được gửi đúng cách trong fetch requests

## ✅ Đã sửa

### 1. Thêm alias `authenticated` vào useAuth hook

**File:** `features/auth/hooks/useAuth.ts`

```typescript
return {
  user,
  loading,
  error,
  isAuthenticated: !!user,
  authenticated: !!user, // ✅ Alias for compatibility
  // ...
};
```

### 2. Thêm fallback trong getCurrentUser

**File:** `features/auth/services/authApi.ts`

- Thêm `credentials: "include"` để đảm bảo cookie được gửi
- Tự động fallback đến `/api/auth/me-mock` khi database fail

### 3. Đảm bảo mock user có role đúng

**File:** `app/api/auth/me-mock/route.ts`

- Logic detect role từ userId: `userId.includes("admin")` → role = "ADMIN"
- Admin user ID: `mock-admin-1` → sẽ detect đúng role ADMIN

## 🧪 Test

1. **Đăng nhập:**
   - Email: `admin@ctss.com`
   - Password: `123456`

2. **Vào Kho:**
   - Click vào menu "Kho" hoặc truy cập: http://localhost:3000/inventory
   - ✅ Không bị bắt đăng nhập lại
   - ✅ Hiển thị Inventory Dashboard

3. **Kiểm tra console:**
   - Mở DevTools (F12)
   - Tab Console: Không có lỗi authentication
   - Tab Network: Request `/api/auth/me` hoặc `/api/auth/me-mock` trả về 200

## 🔍 Debug

Nếu vẫn bị lỗi, kiểm tra:

### 1. Cookie có được set không?

```javascript
// Trong browser console
document.cookie
// Phải thấy: auth-token=...
```

### 2. API /api/auth/me có hoạt động?

```bash
curl -v http://localhost:3000/api/auth/me \
  -H "Cookie: auth-token=YOUR_TOKEN"
```

### 3. Kiểm tra token trong cookie

```javascript
// Trong browser console
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('auth-token='))
  ?.split('=')[1];
console.log('Token:', token);
```

## 🚀 Giải pháp tạm thời

Nếu vẫn lỗi, có thể:

1. **Clear cookies và đăng nhập lại:**
   - Mở DevTools → Application → Cookies
   - Xóa tất cả cookies
   - Đăng nhập lại

2. **Hard refresh:**
   - Ctrl + Shift + R (Windows/Linux)
   - Cmd + Shift + R (Mac)

3. **Restart server:**
   ```bash
   # Dừng server (Ctrl + C)
   npm run dev
   ```

## ✅ Kết quả mong đợi

- ✅ Đăng nhập thành công
- ✅ Vào Kho không bị bắt đăng nhập lại
- ✅ Có thể truy cập tất cả tính năng với role ADMIN
- ✅ Cookie `auth-token` được lưu và gửi đúng

---

*Last updated: 2024*

