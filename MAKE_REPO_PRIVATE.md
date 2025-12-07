# 🔒 Hướng dẫn đổi repo sang Private trên GitHub

## Cách 1: Đổi trên GitHub Web (Dễ nhất)

### Bước 1: Vào Settings
1. Mở repo: https://github.com/Growcosmetic/ctss
2. Click vào tab **Settings** (phía trên cùng)

### Bước 2: Scroll xuống phần Danger Zone
1. Scroll xuống cuối trang Settings
2. Tìm phần **"Danger Zone"** (màu đỏ)

### Bước 3: Đổi visibility
1. Click vào nút **"Change visibility"**
2. Chọn **"Make private"**
3. Nhập tên repo: `Growcosmetic/ctss` để confirm
4. Click **"I understand, change repository visibility"**

### Bước 4: Xác nhận
- GitHub sẽ yêu cầu xác nhận lại
- Click **"Change visibility"** để hoàn tất

---

## Cách 2: Dùng GitHub CLI (Nếu có)

```bash
# Cài GitHub CLI (nếu chưa có)
brew install gh

# Login
gh auth login

# Đổi sang private
gh repo edit Growcosmetic/ctss --visibility private
```

---

## ⚠️ Lưu ý quan trọng

### 1. Ai có thể truy cập
- **Public**: Bất kỳ ai trên internet đều có thể xem
- **Private**: Chỉ bạn và người được invite mới xem được

### 2. Sau khi đổi sang Private
- Code sẽ không còn hiển thị công khai
- Chỉ những người được bạn invite mới xem được
- Vẫn có thể clone và push bình thường

### 3. Giới hạn
- **Free plan**: Unlimited private repos
- **Private repo**: Có thể có tối đa 3 collaborators (free plan)

---

## 🔐 Mời người khác vào repo Private

### Cách mời collaborator:
1. Vào repo: https://github.com/Growcosmetic/ctss
2. Click **Settings** → **Collaborators**
3. Click **"Add people"**
4. Nhập username hoặc email
5. Chọn quyền: **Read**, **Write**, hoặc **Admin**
6. Gửi invitation

---

## ✅ Kiểm tra visibility hiện tại

Repo hiện tại là: **PUBLIC** (ai cũng xem được)

Sau khi đổi sang **PRIVATE**:
- URL vẫn giữ nguyên: https://github.com/Growcosmetic/ctss
- Nhưng chỉ người được invite mới vào được
- Người khác sẽ thấy: "404 - This repository is private"

---

## 🚀 Quick Steps (Copy & Paste)

1. Vào: https://github.com/Growcosmetic/ctss/settings
2. Scroll xuống **"Danger Zone"**
3. Click **"Change visibility"** → **"Make private"**
4. Confirm với tên repo
5. Done! ✅

