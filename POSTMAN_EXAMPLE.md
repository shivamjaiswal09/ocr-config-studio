# 🚀 Quick Postman Test - OCR API

## 📍 **Base URL**
```
http://localhost:3000
```

---

## 🎯 **Main OCR Endpoint**

### **POST** `/api/ocr/run`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**

```json
{
  "configId": "0a3ee908-ec1d-478b-90e1-3954556f32f6",
  "imageData": "data:image/jpeg;base64,YOUR_BASE64_IMAGE_HERE",
  "fileType": "image/jpeg"
}
```

**For PDF:**
```json
{
  "configId": "0a3ee908-ec1d-478b-90e1-3954556f32f6",
  "imageData": "data:application/pdf;base64,YOUR_BASE64_PDF_HERE",
  "fileType": "application/pdf"
}
```

---

## 📋 **Step-by-Step Postman Setup**

### **1. Create New Request**
- Method: `POST`
- URL: `http://localhost:3000/api/ocr/run`

### **2. Set Headers**
- Key: `Content-Type`
- Value: `application/json`

### **3. Set Body (raw JSON)**
- Select "Body" tab
- Choose "raw"
- Select "JSON" from dropdown
- Paste the JSON above (replace `YOUR_BASE64_IMAGE_HERE`)

### **4. Convert Image to Base64**

**Quick Method - Use Browser:**
1. Open https://base64.guru/converter/encode/image
2. Upload your invoice image
3. Copy the base64 string
4. Paste it in the `imageData` field (add `data:image/jpeg;base64,` prefix)

**Or use this JavaScript in browser console:**
```javascript
// Paste this in browser console, select file, copy output
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = e => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = event => {
    console.log(event.target.result); // Copy this entire string
  };
  reader.readAsDataURL(file);
};
input.click();
```

### **5. Send Request**

Click "Send" and wait 5-15 seconds for response!

---

## ✅ **Expected Response**

```json
{
  "runId": "f49a2f6d-b0e7-4363-bfb3-8bcf479fc68e",
  "status": "success",
  "mapped_payload": {
    "invoice_number": "TN2501590911"
  },
  "raw_response": {
    "invoice_number": "TN2501590911",
    "supplier_name": "...",
    "customer_name": "...",
    "invoice_date": "2024-01-15",
    "total_amount": 6844.00,
    "gst_amount": 1044.00,
    "line_items": [...],
    "cgst": 522.00,
    "sgst": 522.00,
    "igst": 0.00
  }
}
```

---

## 🔧 **Other Useful Endpoints**

### **Get All Configs**
```
GET http://localhost:3000/api/configs
```

### **Get Specific Config**
```
GET http://localhost:3000/api/configs?companyId=123&documentType=Freight Invoiceq
```

### **Create New Config**
```
POST http://localhost:3000/api/configs
Body: {
  "document_type": "Freight Invoice",
  "company_id": "123",
  "apply_at_transporter_level": false,
  "fields": [...],
  "prompt": "..."
}
```

---

## 💡 **Pro Tips**

1. **Save as Collection**: Create a Postman collection for easy reuse
2. **Environment Variables**: Use `{{baseUrl}}` and `{{configId}}` variables
3. **Pre-request Script**: Auto-convert images to base64
4. **Tests**: Add assertions to validate response structure

---

## 🐛 **Troubleshooting**

**Error: "Config not found"**
- Check configId is correct
- Call `GET /api/configs` to see available configs

**Error: "Invalid base64"**
- Make sure you include the `data:image/jpeg;base64,` prefix
- Check base64 string is complete (no truncation)

**Error: "File too large"**
- Keep images under 10MB
- Compress images before converting to base64

---

**Ready to test!** 🚀

