#!/bin/bash

# Script để tạo SSH tunnel từ localhost đến VPS PostgreSQL
# Usage: ./scripts/setup-ssh-tunnel.sh

echo "🔗 Đang tạo SSH tunnel đến VPS PostgreSQL..."
echo ""
echo "📌 Tunnel sẽ map:"
echo "   Local port 5433 -> VPS localhost:5432"
echo ""
echo "⚠️  Giữ terminal này mở để duy trì tunnel"
echo "   Nhấn Ctrl+C để dừng tunnel"
echo ""

# Tạo tunnel
ssh -L 5433:localhost:5432 root@72.61.119.247 -N

