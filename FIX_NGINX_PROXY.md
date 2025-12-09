# 🔧 Fix: Nginx vẫn hiển thị trang mặc định

## Tình trạng hiện tại:
✅ PM2: App đang chạy tốt trên port 3000 (`curl http://localhost:3000` trả về `/login`)
❌ Nginx: Vẫn hiển thị trang "Welcome to nginx!" thay vì proxy đến app

## Nguyên nhân:
Cấu hình Nginx chưa đúng hoặc chưa được load.

## Giải pháp:

### BƯỚC 1: Kiểm tra cấu hình Nginx hiện tại

```bash
cat /etc/nginx/sites-enabled/ctss
```

Phải thấy dòng: `proxy_pass http://localhost:3000;`

### BƯỚC 2: Kiểm tra có file default nào không

```bash
ls -la /etc/nginx/sites-enabled/
```

Nếu thấy file `default`, xóa nó:
```bash
rm -f /etc/nginx/sites-enabled/default
```

### BƯỚC 3: Đảm bảo file cấu hình đúng

```bash
cd ~/ctss
cat nginx-ctss.conf
```

Copy nội dung và so sánh với file trong `/etc/nginx/sites-available/ctss`

### BƯỚC 4: Copy lại file cấu hình

```bash
cd ~/ctss
cp nginx-ctss.conf /etc/nginx/sites-available/ctss
```

### BƯỚC 5: Enable lại cấu hình

```bash
rm -f /etc/nginx/sites-enabled/ctss
ln -s /etc/nginx/sites-available/ctss /etc/nginx/sites-enabled/ctss
```

### BƯỚC 6: Test và restart Nginx

```bash
nginx -t
systemctl restart nginx
```

### BƯỚC 7: Kiểm tra lại

```bash
curl http://localhost
```

Bây giờ phải thấy HTML của app CTSS (không phải "Welcome to nginx!")

---

## Nếu vẫn không được:

### Kiểm tra logs Nginx:

```bash
tail -20 /var/log/nginx/error.log
```

### Kiểm tra cấu hình có được load không:

```bash
nginx -T | grep -A 20 "server_name"
```

---

## Kiểm tra từ browser:

Truy cập: `http://72.61.119.247`

Bây giờ phải thấy trang login của CTSS (không phải "Welcome to nginx!")

