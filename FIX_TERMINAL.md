# 🔧 Fix: Terminal không phản hồi

## Vấn đề:
Dán lệnh vào terminal không có tác dụng.

## Nguyên nhân có thể:
1. Terminal đang chờ input (có process đang chạy)
2. Terminal bị treo
3. Cần nhấn Enter sau khi dán

## Giải pháp:

### BƯỚC 1: Kiểm tra terminal có đang chờ input không

Nhấn `Ctrl+C` nhiều lần để dừng bất kỳ process nào đang chạy.

### BƯỚC 2: Mở terminal mới

Nếu terminal không phản hồi, **mở một terminal/SSH session mới** và kết nối lại:

```bash
ssh root@72.61.119.247
```

### BƯỚC 3: Kiểm tra có process nào đang chạy không

```bash
ps aux | grep -E "node|npm|next|pm2"
```

### BƯỚC 4: Kill tất cả process Node.js

```bash
pkill -9 node
pkill -9 npm
pm2 kill
```

### BƯỚC 5: Chạy từng lệnh một (KHÔNG dán nhiều lệnh cùng lúc)

Chạy từng lệnh một, chờ kết quả rồi mới chạy lệnh tiếp theo:

```bash
cd ~/ctss
```

Nhấn Enter, chờ xong rồi chạy tiếp:

```bash
pm2 status
```

Nhấn Enter, chờ xong rồi chạy tiếp:

```bash
pm2 list
```

---

## Cách test đơn giản nhất:

### Test 1: Kiểm tra bạn đang ở đâu

```bash
pwd
```

Phải thấy: `/root/ctss`

### Test 2: Kiểm tra PM2

```bash
pm2 list
```

### Test 3: Kiểm tra port 3000

```bash
netstat -tulpn | grep 3000
```

---

## Nếu terminal vẫn không phản hồi:

1. **Đóng terminal hiện tại**
2. **Mở terminal/SSH mới**
3. **Kết nối lại:**
   ```bash
   ssh root@72.61.119.247
   ```
4. **Chạy lại từ đầu**

---

## Lưu ý quan trọng:

- **KHÔNG dán nhiều lệnh cùng lúc** - chạy từng lệnh một
- **Nhấn Enter sau mỗi lệnh**
- **Chờ kết quả trước khi chạy lệnh tiếp theo**
- **Nếu terminal treo, nhấn `Ctrl+C` nhiều lần**

