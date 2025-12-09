#!/bin/bash

echo "🔧 FIX DATABASE PERMISSION - VERSION 2"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Đang grant quyền chi tiết hơn...${NC}"

sudo -u postgres psql -d ctss << 'EOF'
-- Drop và recreate schema nếu cần (cẩn thận!)
-- DROP SCHEMA IF EXISTS public CASCADE;
-- CREATE SCHEMA public;
-- GRANT ALL ON SCHEMA public TO postgres;
-- GRANT ALL ON SCHEMA public TO public;

-- Grant quyền cho ctssuser
GRANT ALL ON SCHEMA public TO ctssuser;
GRANT CREATE ON SCHEMA public TO ctssuser;
GRANT USAGE ON SCHEMA public TO ctssuser;

-- Grant quyền trên database
GRANT ALL PRIVILEGES ON DATABASE ctss TO ctssuser;

-- Grant quyền trên tất cả tables hiện tại và tương lai
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ctssuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ctssuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO ctssuser;

-- Nếu có tables, grant trực tiếp
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON TABLE public.' || quote_ident(r.tablename) || ' TO ctssuser';
    END LOOP;
END $$;

-- Nếu có sequences, grant trực tiếp
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
        EXECUTE 'GRANT ALL PRIVILEGES ON SEQUENCE public.' || quote_ident(r.sequence_name) || ' TO ctssuser';
    END LOOP;
END $$;

\q
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Grant quyền thành công${NC}"
else
    echo -e "${RED}❌ Grant quyền thất bại${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Thử push schema lại...${NC}"
cd ~/ctss
npx prisma db push

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Push schema thành công!${NC}"
else
    echo -e "${RED}❌ Push schema vẫn thất bại${NC}"
    echo ""
    echo -e "${YELLOW}Thử cách khác: Dùng postgres user để push...${NC}"
    echo "Sửa DATABASE_URL trong .env thành:"
    echo 'DATABASE_URL="postgresql://postgres:YOUR_POSTGRES_PASSWORD@localhost:5432/ctss"'
fi

