-- ============================================
-- FIX DATABASE FOREIGN KEY CONSTRAINT
-- Chạy trong psql hoặc database client
-- ============================================

-- 1. Kiểm tra ProductStock có branchId không hợp lệ
SELECT COUNT(*) as invalid_count
FROM "ProductStock" 
WHERE "branchId" NOT IN (SELECT id FROM "Branch");

-- 2. Tạo branch mặc định nếu chưa có
INSERT INTO "Branch" (id, name, code, "createdAt", "updatedAt")
SELECT 'default-branch-id', 'Chi nhánh mặc định', 'DEFAULT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Branch" WHERE id = 'default-branch-id');

-- 3. Xóa ProductStock với branchId không tồn tại (CẨN THẬN - mất dữ liệu)
-- DELETE FROM "ProductStock" 
-- WHERE "branchId" NOT IN (SELECT id FROM "Branch");

-- HOẶC: Cập nhật ProductStock với branchId không hợp lệ về branch mặc định
UPDATE "ProductStock" 
SET "branchId" = 'default-branch-id'
WHERE "branchId" NOT IN (SELECT id FROM "Branch") OR "branchId" IS NULL;

-- 4. Kiểm tra lại
SELECT COUNT(*) as remaining_invalid
FROM "ProductStock" 
WHERE "branchId" NOT IN (SELECT id FROM "Branch");

-- 5. Sau đó chạy: npx prisma db push --accept-data-loss
