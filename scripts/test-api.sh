#!/bin/bash

API_BASE="http://localhost:3000/api"

echo "🧪 Testing PDF Template Engine API"
echo "===================================="
echo ""

# Test 1: Health check
echo "1️⃣  Testing health endpoint..."
curl -s http://localhost:3000/health | jq .
echo ""

# Test 2: Get template (should return default invoice template)
echo "2️⃣  Fetching default invoice template..."
curl -s "$API_BASE/pdf-template?document_type=invoice" | jq .
echo ""

# Test 3: Generate PDF
echo "3️⃣  Generating sample invoice PDF..."
curl -s -X POST "$API_BASE/pdf-template/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "invoice",
    "payload": {
      "invoice_number": "INV-17575",
      "invoice_date": "2024-01-15",
      "trip_id": "36369289",
      "vehicle_number": "MH12AB1234",
      "lr_number": "LR-2024-001",
      "consignor_name": "ABC Manufacturing Pvt Ltd",
      "consignor_address": "123 Industrial Area, Mumbai - 400001",
      "consignor_gst": "27AABCU9603R1ZM",
      "consignee_name": "XYZ Retail Store",
      "consignee_address": "456 Market Road, Delhi - 110001",
      "consignee_gst": "07AABCX9603R1ZN",
      "transporter_name": "Union Transport Co.",
      "transporter_gst": "27AABCT1234F1Z5",
      "from_location": "Mumbai",
      "to_location": "Delhi",
      "route": "Mumbai -> Vadodara -> Ahmedabad -> Jaipur -> Delhi",
      "product_name": "Adhesive Shampoo - 200ml bottles",
      "quantity": 1000,
      "weight": 500,
      "freight_charge": 7534.00,
      "loading_charge": 500.00,
      "unloading_charge": 500.00,
      "detention_charge": 0,
      "other_charges": 0,
      "cgst": 676.53,
      "sgst": 676.53,
      "igst": 0,
      "total_amount": 9887.06,
      "bank_details": "Bank: HDFC Bank\\nAccount: 50200012345678\\nIFSC: HDFC0001234\\nBranch: Mumbai Main"
    }
  }' | jq .

echo ""
echo "✅ API tests complete!"
echo ""
echo "📄 Check the outputs directory for generated PDFs"

