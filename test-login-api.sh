#!/bin/bash

# Script để test login API

echo "🧪 Testing login API..."

cd ~/ctss || exit 1

echo ""
echo "1. Testing login endpoint..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0900000001","password":"123456"}' \
  -v \
  -c /tmp/cookies.txt

echo ""
echo ""
echo "2. Testing /api/auth/me with cookie..."
curl -X GET http://localhost:3000/api/auth/me \
  -b /tmp/cookies.txt \
  -v

echo ""
echo ""
echo "✅ Test completed!"
echo "Check cookies.txt for cookie value"

