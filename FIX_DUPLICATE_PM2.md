# 🔧 Fix: PM2 có 2 processes - một online, một errored

## Vấn đề:
- Process 0: `ctss` - **online** ✅ (đang chạy tốt)
- Process 1: `ctss` - **errored** ❌ (bị lỗi)

## Giải pháp:

### BƯỚC 1: Xóa process bị lỗi (id 1)

```bash
pm2 delete 1
```

### BƯỚC 2: Kiểm tra lại

```bash
pm2 list
```

Bây giờ chỉ còn 1 process `ctss` với status `online`.

### BƯỚC 3: Kiểm tra app có chạy được không

```bash
curl http://localhost:3000
```

Nếu thấy HTML response, app đang chạy tốt!

### BƯỚC 4: Kiểm tra Nginx

```bash
curl http://localhost
```

Hoặc truy cập: `http://72.61.119.247`

---

## Nếu vẫn thấy trang "Welcome to nginx!":

### Kiểm tra cấu hình Nginx:

```bash
cat /etc/nginx/sites-enabled/ctss
```

Phải có dòng: `proxy_pass http://localhost:3000;`

### Restart Nginx:

```bash
nginx -t
systemctl restart nginx
```

### Kiểm tra lại:

```bash
curl http://localhost
```

---

## Lưu ý:

- Process 0 đang chạy tốt (online, 57.9mb)
- Chỉ cần xóa process 1 (errored)
- Sau đó test app và Nginx

