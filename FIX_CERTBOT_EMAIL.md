# 🔧 Sửa Lỗi Certbot Email

## ❌ Lỗi: "Invalid email address"

### Giải pháp 1: Nhập email hợp lệ

Khi Certbot hỏi email, nhập email của bạn:

```
Enter email address (used for urgent renewal and security notices): your-email@gmail.com
```

**Lưu ý:** Email phải có định dạng hợp lệ (có @ và domain)

### Giải pháp 2: Bỏ qua email (không khuyến nghị)

Nếu muốn bỏ qua email, gõ `c` để cancel, sau đó chạy lại với flag:

```bash
certbot --nginx -d ctss.huynhchitam.com --register-unsafely-without-email
```

**⚠️ Cảnh báo:** Bạn sẽ không nhận được thông báo khi certificate sắp hết hạn!

### Giải pháp 3: Chạy lại với email từ đầu

```bash
certbot --nginx -d ctss.huynhchitam.com --email your-email@gmail.com --agree-tos --non-interactive
```

Thay `your-email@gmail.com` bằng email thực tế của bạn.
