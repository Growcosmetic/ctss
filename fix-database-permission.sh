#!/bin/bash

# Script để fix database permission

echo "🔧 Fix Database Permission"
echo ""

# Kiểm tra DATABASE_URL
if [ -f .env ]; then
    DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2 | tr -d '"')
    if [ -z "$DB_URL" ]; then
        echo "❌ DATABASE_URL not found in .env"
        exit 1
    fi
    
    # Parse DATABASE_URL
    # Format: postgresql://user:password@host:port/database
    DB_USER=$(echo $DB_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
    DB_PASS=$(echo $DB_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
    DB_HOST=$(echo $DB_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
    DB_PORT=$(echo $DB_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
    DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    echo "📊 Database Info:"
    echo "  User: $DB_USER"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo ""
    
    echo "📝 SQL Commands to run:"
    echo ""
    echo "psql -U postgres -d $DB_NAME"
    echo ""
    echo "Then run:"
    echo ""
    echo "GRANT USAGE ON SCHEMA public TO $DB_USER;"
    echo "GRANT CREATE ON SCHEMA public TO $DB_USER;"
    echo "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;"
    echo "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
    echo "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
    echo "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"
    echo ""
    echo "Or use prisma db push instead:"
    echo "  npx prisma db push"
else
    echo "❌ .env file not found"
    exit 1
fi

