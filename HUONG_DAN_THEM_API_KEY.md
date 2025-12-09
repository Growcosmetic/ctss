# 🔑 Hướng dẫn thêm OPENAI_API_KEY vào .env trên VPS

## BƯỚC 1: Kiểm tra file .env hiện tại

```bash
cd ~/ctss
cat .env
```

## BƯỚC 2: Thêm OPENAI_API_KEY vào .env

**Cách 1: Sử dụng nano (khuyến nghị)**

```bash
nano .env
```

Sau đó thêm dòng này vào cuối file:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

**Lưu ý:** Thay `sk-your-actual-api-key-here` bằng API key thật của bạn (bắt đầu bằng `sk-`)

**Cách lưu trong nano:**
- Nhấn `Ctrl + O` để lưu
- Nhấn `Enter` để xác nhận
- Nhấn `Ctrl + X` để thoát

**Cách 2: Sử dụng echo (nhanh)**

```bash
echo "OPENAI_API_KEY=sk-your-actual-api-key-here" >> .env
```

**Lưu ý:** Thay `sk-your-actual-api-key-here` bằng API key thật của bạn

## BƯỚC 3: Kiểm tra lại

```bash
grep OPENAI_API_KEY .env
```

Nếu thấy dòng `OPENAI_API_KEY=sk-...` là OK.

## BƯỚC 4: Build lại

```bash
npm run build
```

## BƯỚC 5: Nếu vẫn lỗi

Có thể cần xóa cache và build lại:

```bash
rm -rf .next
npm run build
```

---

## ⚠️ LƯU Ý QUAN TRỌNG:

1. **API key phải bắt đầu bằng `sk-`**
2. **Không có khoảng trắng** sau dấu `=`
3. **File .env phải ở thư mục gốc** của project (`~/ctss/.env`)
4. **Sau khi thêm API key, cần build lại** để Next.js load biến môi trường mới

