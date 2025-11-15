#!/bin/bash

# Test OCR Extraction API
# This script tests the full OCR extraction pipeline

API_BASE="http://localhost:3000/api"

echo "🧪 Testing OCR Extraction API"
echo "=============================="
echo ""

# Test 1: Extract from sample invoice
echo "📄 Test 1: Extracting data from invoice..."
echo ""

curl -X POST "${API_BASE}/ocr/extract" \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://example.com/invoice.jpg",
    "client_id": "A",
    "branch_id": "7",
    "transporter_id": "TX",
    "doc_type": "invoice"
  }' | jq '.'

echo ""
echo ""

# Test 2: Get template stats
# echo "📊 Test 2: Getting template stats..."
# echo ""
# 
# TEMPLATE_ID="your-template-id-here"
# curl -X GET "${API_BASE}/ocr/templates/${TEMPLATE_ID}/stats" | jq '.'

echo ""
echo "✅ Test complete!"

