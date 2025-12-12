# 🌐 Hướng dẫn Setup Domain - Từng Bước (Cách 1: Tự động)

## 📋 CHUẨN BỊ

Trước khi bắt đầu, bạn cần:
- ✅ Domain đã được quản lý trên Cloudflare
- ✅ Đã đăng nhập được vào Hostinger VPS
- ✅ Biết tên domain của bạn (ví dụ: `chitam.salonhero.vn`)

---

## 🚀 BƯỚC 1: Mở Hostinger Web Terminal

1. Đăng nhập vào **Hostinger**: https://hpanel.hostinger.com
2. Vào **VPS** → Chọn VPS của bạn
3. Click **"Web Terminal"** hoặc **"Terminal"**
4. Đợi terminal mở ra (có thể mất vài giây)

**✅ Kết quả:** Bạn sẽ thấy dòng lệnh như: `root@vps123456:~#`

---

## 📥 BƯỚC 2: Pull Code Mới Từ GitHub

Trong terminal, gõ từng lệnh sau (sau mỗi lệnh nhấn Enter):

```bash
cd ~/ctss
```

```bash
git pull origin main
```

**✅ Kết quả:** Sẽ thấy thông báo "Already up to date" hoặc "Updating..."

---

## 🔧 BƯỚC 3: Chạy Script Setup Domain

Gõ lệnh:

```bash
chmod +x setup-domain.sh
```

Sau đó chạy script:

```bash
./setup-domain.sh
```

**✅ Kết quả:** Script sẽ hỏi domain của bạn

---

## 📝 BƯỚC 4: Nhập Domain Của Bạn

Khi script hỏi:
```
Nhập domain của bạn (ví dụ: chitam.salonhero.vn):
```

**Bạn gõ domain của mình** (ví dụ: `chitam.salonhero.vn` hoặc `app.yourdomain.com`)

Nhấn **Enter**

**✅ Kết quả:** Script sẽ hiển thị domain bạn vừa nhập

---

## 🔒 BƯỚC 5: Chọn Có/ Không Setup SSL

Script sẽ hỏi:
```
Bạn có muốn setup SSL với Let's Encrypt? (y/n):
```

**Gõ `y`** (yes) nếu muốn có HTTPS (khuyến nghị)
**Gõ `n`** (no) nếu chỉ muốn HTTP tạm thời

Nhấn **Enter**

**Lưu ý:** Nếu chọn `y`, script sẽ hỏi bạn nhấn Enter để tiếp tục (đợi bạn cấu hình DNS trước)

---

## 🌐 BƯỚC 6: Cấu Hình DNS Trên Cloudflare

**QUAN TRỌNG:** Làm bước này TRƯỚC khi setup SSL!

### 6.1. Mở Cloudflare

1. Truy cập: https://dash.cloudflare.com
2. Đăng nhập
3. Chọn **domain của bạn**

### 6.2. Vào DNS Settings

1. Click **"DNS"** ở menu bên trái
2. Click **"Records"**

### 6.3. Thêm DNS Record

Click nút **"+ Add record"**

**Nếu dùng domain chính** (ví dụ: `chitam.salonhero.vn`):

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|-------------|-----|
| A | @ | `72.61.119.247` | 🟠 Proxied | Auto |

**Nếu dùng subdomain** (ví dụ: `app.yourdomain.com`):

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|-------------|-----|
| A | app | `72.61.119.247` | 🟠 Proxied | Auto |

**Cách điền:**
- **Type:** Chọn `A`
- **Name:** 
  - Nếu domain chính: gõ `@` hoặc để trống
  - Nếu subdomain: gõ tên subdomain (ví dụ: `app`)
- **IPv4 address:** Gõ `72.61.119.247`
- **Proxy status:** Bật **🟠 Proxied** (nút cam)
- **TTL:** Để `Auto`

Click **"Save"**

### 6.4. Thêm Record cho www (tùy chọn)

Nếu muốn `www.yourdomain.com` cũng hoạt động:

Thêm record thứ 2:

| Type | Name | Content | Proxy status | TTL |
|------|------|---------|-------------|-----|
| A | www | `72.61.119.247` | 🟠 Proxied | Auto |

**✅ Kết quả:** DNS đã được cấu hình

---

## ⏳ BƯỚC 7: Đợi DNS Propagate

**QUAN TRỌNG:** Phải đợi 5-10 phút để DNS trỏ đúng!

### Kiểm tra DNS đã trỏ đúng chưa:

Quay lại terminal trên VPS, gõ:

```bash
nslookup yourdomain.com
```

**Thay `yourdomain.com` bằng domain thực tế của bạn**

**✅ Kết quả mong đợi:**
```
Name:   yourdomain.com
Address: 72.61.119.247
```

**Nếu chưa thấy IP `72.61.119.247`:**
- Đợi thêm 5-10 phút
- Hoặc kiểm tra lại DNS trên Cloudflare

---

## 🔒 BƯỚC 8: Quay Lại Setup SSL (Nếu đã chọn y ở Bước 5)

Nếu ở Bước 5 bạn đã chọn `y` nhưng chưa cấu hình DNS, bây giờ:

1. **Đảm bảo DNS đã trỏ đúng** (kiểm tra bằng `nslookup`)
2. Chạy lại lệnh setup SSL:

```bash
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**Thay `yourdomain.com` bằng domain thực tế**

**Hoặc nếu chỉ dùng subdomain:**

```bash
certbot --nginx -d app.yourdomain.com
```

**✅ Kết quả:** 
- Certbot sẽ tự động cấu hình SSL
- Nginx sẽ được cập nhật để dùng HTTPS
- Certificate sẽ tự động renew mỗi 90 ngày

---

## ✅ BƯỚC 9: Kiểm Tra Kết Quả

### 9.1. Kiểm tra Nginx

```bash
systemctl status nginx
```

**✅ Phải thấy:** `active (running)`

### 9.2. Kiểm tra PM2

```bash
pm2 status
```

**✅ Phải thấy:** `ctss` với status `online`

### 9.3. Kiểm tra từ trình duyệt

Mở trình duyệt, truy cập:

- `https://yourdomain.com` → Phải hiển thị ứng dụng
- `https://yourdomain.com/inventory` → Trang kho hàng
- `https://yourdomain.com/crm` → Trang CRM

**✅ Phải thấy:**
- 🔒 Icon khóa màu xanh (HTTPS)
- Ứng dụng hiển thị bình thường
- Không có lỗi 502, 404

---

## 🎯 HOÀN TẤT!

Nếu tất cả các bước trên đều ✅, bạn đã setup domain thành công!

**Truy cập ứng dụng:**
- 🌐 **Domain:** `https://yourdomain.com`
- 📦 **Inventory:** `https://yourdomain.com/inventory`
- 👥 **CRM:** `https://yourdomain.com/crm`

---

## ❌ TROUBLESHOOTING (Nếu có lỗi)

### Lỗi: "502 Bad Gateway"

**Nguyên nhân:** PM2 không chạy

**Giải pháp:**
```bash
pm2 status
pm2 restart ctss
pm2 logs ctss
```

### Lỗi: "This site can't be reached"

**Nguyên nhân:** DNS chưa trỏ đúng

**Giải pháp:**
1. Kiểm tra lại DNS trên Cloudflare
2. Đợi thêm 10-15 phút
3. Kiểm tra lại bằng `nslookup`

### Lỗi: "SSL certificate error"

**Nguyên nhân:** DNS chưa propagate khi setup SSL

**Giải pháp:**
```bash
# Xóa certificate cũ
certbot delete --cert-name yourdomain.com

# Setup lại (sau khi DNS đã đúng)
certbot --nginx -d yourdomain.com
```

### Lỗi: "Nginx: [emerg] bind() to 0.0.0.0:80 failed"

**Nguyên nhân:** Port 80 đã bị dùng

**Giải pháp:**
```bash
# Tìm process đang dùng port 80
lsof -i:80

# Kill process (thay PID)
kill -9 <PID>

# Restart Nginx
systemctl restart nginx
```

---

## 📞 CẦN HỖ TRỢ?

Nếu gặp vấn đề, gửi cho tôi:
1. Lỗi cụ thể bạn gặp
2. Output của lệnh `pm2 status`
3. Output của lệnh `systemctl status nginx`
4. Output của lệnh `nslookup yourdomain.com`

---

**Chúc bạn thành công! 🚀**
