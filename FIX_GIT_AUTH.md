# 🔧 Fix: GitHub Authentication Required

## Vấn đề:
Khi `git pull`, hệ thống yêu cầu username/password.

## Nguyên nhân:
- Repository đã chuyển sang **Private**
- Hoặc cần **Personal Access Token** thay vì password

---

## ✅ Giải pháp:

### CÁCH 1: Dùng Personal Access Token (Khuyến nghị)

#### Bước 1: Tạo Personal Access Token trên GitHub

1. Vào GitHub: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Đặt tên: `CTSS-VPS`
4. Chọn quyền:
   - ✅ `repo` (Full control of private repositories)
5. Click **"Generate token"**
6. **Copy token ngay** (chỉ hiện 1 lần!)

#### Bước 2: Dùng token khi pull

Khi được hỏi:
- **Username**: `Growcosmetic` (hoặc username GitHub của bạn)
- **Password**: Dán token vừa tạo (KHÔNG phải password GitHub)

---

### CÁCH 2: Setup SSH Key (Lâu dài)

#### Bước 1: Tạo SSH key trên VPS

```bash
ssh-keygen -t ed25519 -C "ctss-vps@your-email.com"
# Nhấn Enter để chấp nhận default
# Không cần password (Enter 2 lần)
```

#### Bước 2: Copy public key

```bash
cat ~/.ssh/id_ed25519.pub
```

Copy toàn bộ output (bắt đầu bằng `ssh-ed25519...`)

#### Bước 3: Thêm SSH key vào GitHub

1. Vào: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `CTSS VPS`
4. Key: Dán public key vừa copy
5. Click **"Add SSH key"**

#### Bước 4: Đổi remote sang SSH

```bash
cd ~/ctss
git remote set-url origin git@github.com:Growcosmetic/ctss.git
git pull origin main
```

---

### CÁCH 3: Dùng Token trong URL (Tạm thời)

```bash
cd ~/ctss
# Thay YOUR_TOKEN bằng token của bạn
git remote set-url origin https://YOUR_TOKEN@github.com/Growcosmetic/ctss.git
git pull origin main
```

**Lưu ý:** Token sẽ hiện trong `.git/config` - không an toàn lắm.

---

## 🚀 Quick Fix (Nhanh nhất):

### Nếu đang bị kẹt ở prompt:

1. **Nhấn `Ctrl+C`** để hủy
2. Tạo token trên GitHub (theo CÁCH 1)
3. Chạy lại:

```bash
cd ~/ctss
git pull origin main
# Username: Growcosmetic
# Password: [Dán token]
```

---

## 💡 Khuyến nghị:

**Dùng SSH Key (CÁCH 2)** vì:
- ✅ An toàn hơn
- ✅ Không cần nhập lại
- ✅ Phù hợp cho VPS

---

## 🆘 Nếu vẫn không được:

### Kiểm tra remote URL:

```bash
cd ~/ctss
git remote -v
```

Nếu thấy `https://github.com/...` → Đổi sang SSH:
```bash
git remote set-url origin git@github.com:Growcosmetic/ctss.git
```

### Test SSH connection:

```bash
ssh -T git@github.com
```

Nếu thấy: `Hi Growcosmetic! You've successfully authenticated...` → OK!

---

## 📝 Tóm tắt:

1. **Tạo Personal Access Token** trên GitHub
2. **Dùng token** khi được hỏi password
3. Hoặc **setup SSH key** để không cần nhập lại

