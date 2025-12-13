# Fix Permissions - Grant Access to ctssuser

## Vấn đề
User `ctssuser` không có quyền truy cập table `Salon`.

## Giải pháp

### Cách 1: Chạy SQL với superuser (postgres)

```bash
# Connect với postgres user (superuser)
psql -U postgres -d ctss

# Hoặc nếu có password
psql "postgresql://postgres:password@localhost:5432/ctss"
```

Sau đó chạy:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ctssuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ctssuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ctssuser;
GRANT ALL PRIVILEGES ON TABLE "Salon" TO ctssuser;
```

### Cách 2: Chạy từ file SQL

Tạo file `grant_permissions.sql`:
```sql
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ctssuser;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ctssuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ctssuser;
GRANT ALL PRIVILEGES ON TABLE "Salon" TO ctssuser;
```

Chạy:
```bash
psql -U postgres -d ctss -f grant_permissions.sql
```

### Cách 3: Cấp quyền owner cho ctssuser

```sql
-- Chuyển ownership của schema public
ALTER SCHEMA public OWNER TO ctssuser;

-- Hoặc chuyển ownership của table Salon
ALTER TABLE "Salon" OWNER TO ctssuser;
```

## Sau khi cấp quyền

```bash
# Test lại seed
npx prisma db seed
```

