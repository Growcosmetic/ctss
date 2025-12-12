#!/bin/bash
# ============================================
# SCRIPT SETUP DOMAIN CHO VPS
# ============================================

echo "🌐 Setup Domain cho VPS..."
echo ""
echo "⚠️  LƯU Ý: Bạn cần thay 'yourdomain.com' bằng domain thực tế!"
echo ""

# Nhập domain
read -p "Nhập domain của bạn (ví dụ: chitam.salonhero.vn): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Domain không được để trống!"
    exit 1
fi

echo ""
echo "📋 Domain: $DOMAIN"
echo ""

# 1. Cài đặt Nginx (nếu chưa có)
echo "📦 Kiểm tra Nginx..."
if ! command -v nginx &> /dev/null; then
    echo "Cài đặt Nginx..."
    apt update
    apt install nginx -y
else
    echo "✅ Nginx đã được cài đặt"
fi

# 2. Tạo file cấu hình Nginx
echo ""
echo "📝 Tạo file cấu hình Nginx..."

cat > /etc/nginx/sites-available/ctss <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    # Increase body size limit for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeout settings
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo "✅ Đã tạo file cấu hình: /etc/nginx/sites-available/ctss"

# 3. Kích hoạt cấu hình
echo ""
echo "🔗 Kích hoạt cấu hình..."
ln -sf /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# 4. Test và reload Nginx
echo ""
echo "🧪 Test cấu hình Nginx..."
if nginx -t; then
    echo "✅ Cấu hình hợp lệ!"
    systemctl reload nginx
    echo "✅ Đã reload Nginx"
else
    echo "❌ Cấu hình có lỗi! Vui lòng kiểm tra lại."
    exit 1
fi

# 5. Cài đặt Certbot (nếu chưa có)
echo ""
read -p "Bạn có muốn setup SSL với Let's Encrypt? (y/n): " SETUP_SSL

if [ "$SETUP_SSL" = "y" ] || [ "$SETUP_SSL" = "Y" ]; then
    echo ""
    echo "📦 Cài đặt Certbot..."
    if ! command -v certbot &> /dev/null; then
        apt install certbot python3-certbot-nginx -y
    fi
    
    echo ""
    echo "🔒 Lấy SSL certificate..."
    echo "⚠️  Đảm bảo DNS đã trỏ đúng về VPS trước khi tiếp tục!"
    read -p "Nhấn Enter để tiếp tục..."
    
    certbot --nginx -d $DOMAIN -d www.$DOMAIN
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL đã được cấu hình!"
    else
        echo "⚠️  Có lỗi khi setup SSL. Bạn có thể thử lại sau."
    fi
fi

# 6. Cập nhật .env
echo ""
echo "⚙️  Cập nhật .env file..."
cd ~/ctss

if [ -f .env ]; then
    # Backup .env
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    
    # Cập nhật NEXT_PUBLIC_APP_URL
    if grep -q "NEXT_PUBLIC_APP_URL" .env; then
        # Update existing
        sed -i "s|NEXT_PUBLIC_APP_URL=.*|NEXT_PUBLIC_APP_URL=https://$DOMAIN|" .env
    else
        # Add new
        echo "" >> .env
        echo "NEXT_PUBLIC_APP_URL=https://$DOMAIN" >> .env
    fi
    
    echo "✅ Đã cập nhật .env"
    echo "📝 NEXT_PUBLIC_APP_URL=https://$DOMAIN"
else
    echo "⚠️  File .env không tồn tại. Vui lòng tạo thủ công."
fi

# 7. Restart PM2
echo ""
echo "🔄 Restart PM2..."
pm2 restart ctss
pm2 save

# 8. Kiểm tra
echo ""
echo "✅ Setup hoàn tất!"
echo ""
echo "📊 Kiểm tra:"
echo "  - Nginx: systemctl status nginx"
echo "  - PM2: pm2 status"
echo "  - Test: curl http://$DOMAIN/health"
echo ""
echo "🌐 Truy cập: https://$DOMAIN"
echo ""
echo "📋 Các bước tiếp theo:"
echo "  1. Cấu hình DNS trên Cloudflare:"
echo "     - Type: A"
echo "     - Name: @ (hoặc subdomain)"
echo "     - Content: 72.61.119.247"
echo "     - Proxy: ON (🟠)"
echo ""
echo "  2. Đợi 5-10 phút để DNS propagate"
echo ""
echo "  3. Kiểm tra: https://$DOMAIN"
