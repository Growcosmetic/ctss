# 🔧 Fix: File cấu hình Nginx không tồn tại

## Vấn đề:
File `/etc/nginx/sites-enabled/ctss` không tồn tại → Nginx đang dùng cấu hình mặc định.

## Giải pháp:

### BƯỚC 1: Kiểm tra file có trong sites-available không

```bash
ls -la /etc/nginx/sites-available/
cat /etc/nginx/sites-available/ctss
```

### BƯỚC 2: Nếu không có, copy từ repo

```bash
cd ~/ctss
git pull origin main
cp nginx-ctss.conf /etc/nginx/sites-available/ctss
```

### BƯỚC 3: Enable cấu hình

```bash
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/ctss
```

### BƯỚC 4: Xóa file default (nếu có)

```bash
rm -f /etc/nginx/sites-enabled/default
```

### BƯỚC 5: Kiểm tra cấu hình

```bash
ls -la /etc/nginx/sites-enabled/
cat /etc/nginx/sites-enabled/ctss
```

Phải thấy file `ctss` và nội dung có `proxy_pass http://localhost:3000;`

### BƯỚC 6: Test và restart Nginx

```bash
nginx -t
systemctl restart nginx
```

### BƯỚC 7: Kiểm tra lại

```bash
curl http://localhost
```

Bây giờ phải thấy HTML của app CTSS!

---

## Kiểm tra từ browser:

Truy cập: `http://72.61.119.247`

Bây giờ phải thấy trang login của CTSS! 🎉

