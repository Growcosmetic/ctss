# 🔒 Kiểm tra Repository Private/Public

## ⚠️ Quan trọng:

**Code sẽ CÔNG KHAI ngay khi bạn push lên GitHub nếu repository là PUBLIC.**

---

## 🔍 Cách kiểm tra repository hiện tại:

### Bước 1: Kiểm tra trên GitHub

1. Truy cập: `https://github.com/Growcosmetic/ctss`
2. Xem góc trên bên phải:
   - 🔒 **Private** = Chỉ bạn và người được mời mới xem được
   - 🌐 **Public** = Ai cũng xem được (công khai)

### Bước 2: Kiểm tra bằng Git

```bash
cd ~/Downloads/ctss
git remote -v
```

Sẽ hiển thị:
```
origin  https://github.com/Growcosmetic/ctss.git (fetch)
origin  https://github.com/Growcosmetic/ctss.git (push)
```

---

## 🔒 Cách đổi sang PRIVATE (nếu đang là PUBLIC):

### Trên GitHub:

1. Truy cập: `https://github.com/Growcosmetic/ctss`
2. Click **Settings** (góc trên bên phải)
3. Scroll xuống phần **Danger Zone**
4. Click **Change visibility** → **Change to private**
5. Xác nhận: Nhập tên repository `Growcosmetic/ctss`
6. Click **I understand, change repository visibility**

**Lưu ý:** 
- Nếu repository đang là **FREE plan**, bạn chỉ có thể có **unlimited private repos** (GitHub miễn phí private repos)
- Nếu là **PUBLIC**, ai cũng có thể xem code của bạn

---

## ✅ Sau khi đổi sang PRIVATE:

- ✅ Chỉ bạn và collaborators mới xem được
- ✅ Code không còn công khai
- ✅ Vẫn push/pull bình thường
- ✅ Không ai khác có thể clone code

---

## 🚨 Lưu ý quan trọng:

### Nếu repository là PUBLIC:
- ⚠️ **Mọi người** có thể xem code
- ⚠️ **Mọi người** có thể clone code
- ⚠️ **Mọi người** có thể fork code
- ✅ Nhưng **KHÔNG THỂ** push code (trừ khi được mời)

### Nếu repository là PRIVATE:
- ✅ Chỉ bạn và người được mời mới xem được
- ✅ Code được bảo vệ
- ✅ Vẫn push/pull bình thường

---

## 🔐 Bảo mật thêm:

### 1. Không commit file nhạy cảm:

**KHÔNG BAO GIỜ** commit các file sau:
- `.env` (chứa API keys, passwords)
- `*.key`, `*.pem` (private keys)
- `config/secrets.json`
- Database credentials

### 2. File đã có trong `.gitignore`:

File `.gitignore` đã loại trừ:
- `.env`
- `node_modules/`
- `.next/`
- `*.log`

### 3. Nếu lỡ commit file nhạy cảm:

```bash
# Xóa file khỏi git history (cẩn thận!)
git rm --cached .env
git commit -m "Remove sensitive file"
git push origin main
```

---

## 📋 Checklist:

- [ ] Kiểm tra repository là Private hay Public
- [ ] Nếu Public → đổi sang Private (nếu cần)
- [ ] Kiểm tra `.gitignore` đã loại trừ file nhạy cảm
- [ ] Không commit `.env` hoặc credentials

---

## 💡 Khuyến nghị:

**Nên để repository là PRIVATE** để:
- ✅ Bảo vệ code
- ✅ Bảo vệ API keys
- ✅ Bảo vệ business logic
- ✅ Chỉ chia sẻ với người cần thiết

---

## 🆘 Nếu cần giúp:

Nếu bạn không chắc repository là Private hay Public, chỉ cần:
1. Truy cập: `https://github.com/Growcosmetic/ctss`
2. Xem góc trên bên phải có icon 🔒 hay 🌐
3. Nếu là 🌐 (Public) → đổi sang Private theo hướng dẫn trên

