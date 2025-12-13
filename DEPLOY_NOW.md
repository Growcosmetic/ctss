# 🚀 Deploy ngay lên VPS

## ✅ Đã push code lên GitHub thành công!

Commit: `bbd1407` - feat: Refactor Sidebar với accordion và tạo All Modules page

## 📋 Các bước deploy lên VPS:

### Option 1: SSH vào VPS và chạy script (Khuyến nghị)

```bash
# 1. SSH vào VPS
ssh root@72.61.119.247

# 2. Chạy script deploy
cd ~/ctss
bash deploy-from-vps.sh
```

### Option 2: Deploy thủ công từng bước

```bash
# 1. SSH vào VPS
ssh root@72.61.119.247

# 2. Pull code từ GitHub
cd ~/ctss
git pull origin main

# 3. Cài đặt dependencies
npm install --legacy-peer-deps

# 4. Cập nhật database
npx prisma generate
npx prisma db push --accept-data-loss

# 5. Build ứng dụng
npm run build

# 6. Khởi động lại PM2
pm2 restart ctss || pm2 start npm --name "ctss" -- start
pm2 save

# 7. Kiểm tra status
pm2 status
pm2 logs ctss --lines 50
```

### Option 3: Sử dụng script từ local (nếu có SSH key setup)

```bash
# Chạy từ local machine
ssh root@72.61.119.247 "cd ~/ctss && bash deploy-from-vps.sh"
```

## 🎯 Tính năng mới đã deploy:

1. **Sidebar Refactor:**
   - Data structure mới với MENU_ITEMS, GROUP_ORDER
   - Single-item groups render trực tiếp (không chevron)
   - Multi-item groups render accordion
   - Auto-collapse sau navigation
   - Scroll bar với height cố định

2. **All Modules Page:**
   - Route: `/modules`
   - Search functionality
   - Group filter
   - Favorite feature
   - Role-based filtering
   - Responsive grid layout

3. **Shared Data Source:**
   - `lib/menuItems.ts` - Single source of truth
   - Sidebar và Modules page dùng chung data

## 🔍 Kiểm tra sau khi deploy:

1. **Kiểm tra Sidebar:**
   - Truy cập bất kỳ trang nào
   - Kiểm tra sidebar hiển thị đúng
   - Test expand/collapse groups
   - Test scroll bar

2. **Kiểm tra All Modules page:**
   - Truy cập `/modules`
   - Test search functionality
   - Test filter buttons
   - Test favorite feature
   - Test navigation

3. **Kiểm tra PM2:**
   ```bash
   pm2 status
   pm2 logs ctss --lines 50
   ```

4. **Kiểm tra ứng dụng:**
   - Truy cập: http://72.61.119.247
   - Test các tính năng chính

## ⚠️ Lưu ý:

- Nếu có lỗi build, kiểm tra:
  - Node version: `node --version` (nên là 18+)
  - Dependencies: `npm install --legacy-peer-deps`
  - Database connection: Kiểm tra `.env` file

- Nếu PM2 không chạy:
  ```bash
  pm2 delete ctss
  pm2 start npm --name "ctss" -- start
  pm2 save
  ```

## 📞 Support:

Nếu gặp vấn đề, kiểm tra:
- `pm2 logs ctss` - Xem logs
- `pm2 status` - Kiểm tra process status
- `npm run build` - Test build locally trước
