#!/bin/bash

echo "=== TEST ĐƠN GIẢN ==="
echo ""
echo "1. Current directory:"
pwd
echo ""

echo "2. PM2 status:"
pm2 list 2>&1
echo ""

echo "3. Port 3000:"
netstat -tulpn | grep 3000 || echo "Không có process nào trên port 3000"
echo ""

echo "4. Test app:"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "App không chạy"
echo ""

echo "5. Test Nginx:"
curl -s -o /dev/null -w "%{http_code}" http://localhost || echo "Nginx không chạy"
echo ""

echo "=== XONG ==="

