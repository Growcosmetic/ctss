#!/bin/bash

echo "🔍 KIỂM TRA TOÀN BỘ HỆ THỐNG"
echo "================================"
echo ""

echo "1. Kiểm tra PM2:"
pm2 status
echo ""

echo "2. Kiểm tra port 3000:"
netstat -tulpn | grep 3000 || echo "Không có process nào đang listen trên port 3000"
echo ""

echo "3. Test app trực tiếp:"
curl -s http://localhost:3000 | head -20 || echo "App không chạy trên port 3000"
echo ""

echo "4. Kiểm tra Nginx:"
systemctl status nginx --no-pager | head -10
echo ""

echo "5. Test Nginx:"
curl -s http://localhost | head -20 || echo "Nginx không phản hồi"
echo ""

echo "6. Kiểm tra file cấu hình Nginx:"
cat /etc/nginx/sites-enabled/ctss 2>/dev/null || echo "File cấu hình không tồn tại"
echo ""

echo "7. Kiểm tra logs PM2:"
pm2 logs ctss --lines 10 --nostream 2>/dev/null || echo "Không có logs"
echo ""

echo "8. Kiểm tra thư mục .next:"
ls -la ~/ctss/.next 2>/dev/null | head -5 || echo "Thư mục .next không tồn tại - cần build lại"
echo ""

