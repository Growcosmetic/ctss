#!/bin/bash

# 🗄️ Script khởi động PostgreSQL Database
# Script này sẽ kiểm tra và khởi động PostgreSQL nếu chưa chạy

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "🗄️  Kiểm tra PostgreSQL..."

# Kiểm tra PostgreSQL đã chạy chưa
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL đã chạy${NC}"
    exit 0
fi

echo -e "${YELLOW}⚠️  PostgreSQL chưa chạy. Đang khởi động...${NC}"

# Thử các cách khởi động PostgreSQL trên macOS
# Cách 1: Dùng brew services (nếu cài qua Homebrew)
if command -v brew > /dev/null 2>&1; then
    echo "   Đang thử khởi động qua brew services..."
    
    # Tìm version PostgreSQL đã cài
    PG_VERSION=$(brew list --formula | grep postgresql | head -1 | grep -oE '[0-9]+' | head -1 || echo "")
    
    if [ -n "$PG_VERSION" ]; then
        echo "   Tìm thấy PostgreSQL version: $PG_VERSION"
        brew services start postgresql@$PG_VERSION 2>/dev/null || brew services start postgresql 2>/dev/null || true
    else
        # Thử các version phổ biến
        brew services start postgresql@14 2>/dev/null || \
        brew services start postgresql@15 2>/dev/null || \
        brew services start postgresql@16 2>/dev/null || \
        brew services start postgresql 2>/dev/null || true
    fi
    
    sleep 3
    
    if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL đã khởi động thành công${NC}"
        exit 0
    fi
fi

# Cách 2: Dùng pg_ctl (nếu có)
if command -v pg_ctl > /dev/null 2>&1; then
    echo "   Đang thử khởi động qua pg_ctl..."
    
    # Tìm data directory
    PG_DATA_DIRS=(
        "/usr/local/var/postgres"
        "/opt/homebrew/var/postgresql@14"
        "/opt/homebrew/var/postgresql@15"
        "/opt/homebrew/var/postgresql@16"
        "$HOME/Library/Application Support/Postgres/var-14"
        "$HOME/Library/Application Support/Postgres/var-15"
        "$HOME/Library/Application Support/Postgres/var-16"
    )
    
    for DATA_DIR in "${PG_DATA_DIRS[@]}"; do
        if [ -d "$DATA_DIR" ]; then
            echo "   Tìm thấy data directory: $DATA_DIR"
            pg_ctl -D "$DATA_DIR" start 2>/dev/null || true
            sleep 3
            
            if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
                echo -e "${GREEN}✅ PostgreSQL đã khởi động thành công${NC}"
                exit 0
            fi
        fi
    done
fi

# Cách 3: Dùng launchctl (macOS)
echo "   Đang thử khởi động qua launchctl..."
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.postgresql*.plist 2>/dev/null || true
sleep 3

if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL đã khởi động thành công${NC}"
    exit 0
fi

# Nếu vẫn không được
echo -e "${RED}❌ Không thể khởi động PostgreSQL tự động${NC}"
echo ""
echo "Vui lòng khởi động PostgreSQL thủ công bằng một trong các cách sau:"
echo ""
echo "1. Nếu cài qua Homebrew:"
echo "   brew services start postgresql@14"
echo "   (hoặc postgresql@15, postgresql@16 tùy version)"
echo ""
echo "2. Hoặc dùng pg_ctl:"
echo "   pg_ctl -D /usr/local/var/postgres start"
echo ""
echo "3. Hoặc dùng PostgreSQL.app (nếu cài GUI):"
echo "   Mở ứng dụng PostgreSQL từ Applications"
echo ""
echo "4. Kiểm tra PostgreSQL đã chạy:"
echo "   pg_isready -h localhost -p 5432"
echo ""
exit 1
