#!/bin/bash

# Test manual update API để xem có cập nhật được membership không
echo "Testing ZaloPay manual update API..."

# Bạn cần thay đổi các giá trị này:
TRANSACTION_ID="250711_50659"  # Lấy từ database transaction_id mới nhất
JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Lấy từ localStorage của browser
BASE_URL="http://localhost:5000"

echo "Transaction ID: $TRANSACTION_ID"
echo "Base URL: $BASE_URL"
echo ""

# Test 1: Kiểm tra payment hiện tại
echo "1. Checking current payment status..."
curl -X GET "$BASE_URL/api/payments/transaction/$TRANSACTION_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool

echo -e "\n2. Manual update payment status..."
curl -X POST "$BASE_URL/api/payments/zalopay/manual-update/$TRANSACTION_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool

echo -e "\n3. Checking payment status after update..."
curl -X GET "$BASE_URL/api/payments/transaction/$TRANSACTION_ID" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  | python -m json.tool

echo -e "\nTest completed!"
