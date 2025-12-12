# 🔧 Sửa Lỗi DNS và SSL

## ❌ Vấn đề 1: Certbot - Invalid Email

### Cách sửa nhanh:

**Trong terminal, khi Certbot hỏi email:**

1. **Nhập email hợp lệ** (ví dụ: `hairsalonchitam@gmail.com`)
2. Nhấn **Enter**
3. Chọn **A** (Agree) khi được hỏi Terms of Service

**Hoặc chạy lại với email từ đầu:**

```bash
certbot --nginx -d ctss.huynhchitam.com --email hairsalonchitam@gmail.com --agree-tos --non-interactive
```

---

## ❌ Vấn đề 2: DNS Record "DNS only" (chưa bật Proxy)

### Hiện tại:
- Record `ctss` đang ở chế độ **"DNS only"** (màu xám)
- Chưa có bảo vệ DDoS và CDN của Cloudflare

### Cách sửa:

1. **Trên Cloudflare:**
   - Click vào nút **"Edit"** của record `ctss`
   - Tìm phần **"Proxy status"**
   - **Bật nút** (chuyển từ xám sang **cam** 🟠)
   - Click **"Save"**

2. **Kết quả:**
   - Icon sẽ chuyển từ xám sang **cam** 🟠
   - Status sẽ là **"Proxied"** thay vì "DNS only"

---

## ✅ Các bước tiếp theo sau khi sửa:

### 1. Đợi DNS propagate (5-10 phút)

### 2. Kiểm tra DNS đã trỏ đúng:

```bash
nslookup ctss.huynhchitam.com
```

**Phải thấy:** `72.61.119.247` hoặc IP của Cloudflare (nếu đã bật Proxy)

### 3. Chạy lại Certbot:

```bash
certbot --nginx -d ctss.huynhchitam.com
```

**Lần này:**
- Nhập email hợp lệ khi được hỏi
- Chọn **A** (Agree) cho Terms of Service
- Chọn **2** (Redirect HTTP to HTTPS) khi được hỏi

### 4. Kiểm tra kết quả:

```bash
# Kiểm tra Nginx
systemctl status nginx

# Kiểm tra SSL
curl -I https://ctss.huynhchitam.com

# Xem certificate
certbot certificates
```

---

## 🎯 Tóm tắt các lệnh:

```bash
# 1. Chạy Certbot với email
certbot --nginx -d ctss.huynhchitam.com --email hairsalonchitam@gmail.com --agree-tos --non-interactive

# 2. Hoặc chạy tương tác (nhập email khi được hỏi)
certbot --nginx -d ctss.huynhchitam.com

# 3. Kiểm tra
systemctl status nginx
curl -I https://ctss.huynhchitam.com
```

---

## 💡 Lưu ý:

1. **Email:** Phải là email thật, hợp lệ (có @ và domain)
2. **DNS Proxy:** Nên bật Proxy (🟠) để được bảo vệ DDoS
3. **Đợi DNS:** Sau khi sửa DNS, đợi 5-10 phút trước khi chạy Certbot

---

**Sau khi sửa xong, truy cập: `https://ctss.huynhchitam.com`** 🚀
