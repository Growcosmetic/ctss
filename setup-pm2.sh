#!/bin/bash

echo "🚀 Hướng dẫn setup PM2 trên VPS:"
echo ""
echo "📝 Trên VPS, chạy các lệnh sau:"
echo ""
echo "1. Cài đặt PM2 (nếu chưa có):"
echo "   npm install -g pm2"
echo ""
echo "2. Tạo file ecosystem.config.js:"
echo "   nano ecosystem.config.js"
echo ""
echo "3. Copy nội dung sau vào file:"
echo ""
cat << 'EOF'
module.exports = {
  apps: [{
    name: 'ctss',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    cwd: '/root/ctss',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G',
    watch: false
  }]
};
EOF
echo ""
echo "4. Tạo thư mục logs:"
echo "   mkdir -p logs"
echo ""
echo "5. Khởi động app với PM2:"
echo "   pm2 start ecosystem.config.js"
echo ""
echo "6. Lưu cấu hình PM2 để tự động khởi động lại khi server reboot:"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "7. Kiểm tra trạng thái:"
echo "   pm2 status"
echo "   pm2 logs ctss"
echo ""
echo "8. Mở firewall port 3000 (nếu cần):"
echo "   ufw allow 3000/tcp"
echo ""

