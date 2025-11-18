# 🔌 OCR Config Studio - Postman API Guide

## Base URL

**Local Development:**
```
http://localhost:3000
```

**Production (after Vercel deployment):**
```
https://your-app.vercel.app
```

---

## 📋 API Endpoints

### 1. **Run OCR** - Extract data from documents

**Endpoint:** `POST /api/ocr/run`

**Headers:**
```
Content-Type: application/json
```

**Request Body (JSON):**

#### **Option A: Upload Image (JPG, PNG, WebP)**

```json
{
  "configId": "your-config-uuid-here",
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fileType": "image/jpeg"
}
```

#### **Option B: Upload PDF**

```json
{
  "configId": "your-config-uuid-here",
  "imageData": "data:application/pdf;base64,JVBERi0xLjQKJeLjz9MKMy...",
  "fileType": "application/pdf"
}
```

#### **Option C: Use Text Input (Alternative)**

```json
{
  "configId": "your-config-uuid-here",
  "inputText": "FREIGHT INVOICE\n\nInvoice Number: INV-2024-001\n..."
}
```

#### **Option D: Use Config Criteria Instead of configId**

```json
{
  "documentType": "Freight Invoice",
  "companyId": "123",
  "transporterCompanyId": null,
  "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "fileType": "image/jpeg"
}
```

**Response (Success - 200):**

```json
{
  "runId": "f49a2f6d-b0e7-4363-bfb3-8bcf479fc68e",
  "status": "success",
  "mapped_payload": {
    "invoice_number": "TN2501590911"
  },
  "raw_response": {
    "invoice_number": "TN2501590911",
    "supplier_name": "ABC Corp",
    "customer_name": "XYZ Ltd",
    "invoice_date": "2024-01-15",
    "total_amount": 6844.00,
    "gst_amount": 1044.00,
    "line_items": [...]
  }
}
```

**Response (Error - 400/500):**

```json
{
  "error": "Error message here",
  "details": "Detailed error information"
}
```

---

### 2. **List Configurations** - Get all OCR configs

**Endpoint:** `GET /api/configs`

**Query Parameters (Optional):**
- `documentType` - Filter by document type
- `companyId` - Filter by company ID
- `transporterCompanyId` - Filter by transporter company ID

**Example:**
```
GET /api/configs?documentType=Freight Invoice&companyId=123
```

**Response (200):**

```json
[
  {
    "id": "uuid-here",
    "document_type": "Freight Invoice",
    "company_id": "123",
    "apply_at_transporter_level": false,
    "transporter_company_id": null,
    "fields": [
      {
        "field_label": "Invoice Number",
        "field_key": "invoice_number",
        "data_type": "string",
        "required": true,
        "payload_mapping_key": "invoice_number"
      }
    ],
    "prompt": "Extract the following information...",
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-01-15T10:00:00Z"
  }
]
```

---

### 3. **Create Configuration** - Create new OCR config

**Endpoint:** `POST /api/configs`

**Request Body:**

```json
{
  "document_type": "Freight Invoice",
  "company_id": "123",
  "apply_at_transporter_level": false,
  "transporter_company_id": null,
  "fields": [
    {
      "field_label": "Invoice Number",
      "field_key": "invoice_number",
      "data_type": "string",
      "required": true,
      "example_value": "INV-001",
      "payload_mapping_key": "invoice_number"
    }
  ],
  "prompt": "Extract the following information from the freight invoice document accurately."
}
```

**Response (201):**

```json
{
  "id": "new-config-uuid",
  "document_type": "Freight Invoice",
  ...
}
```

---

### 4. **Update Configuration** - Update existing config

**Endpoint:** `PUT /api/configs/[id]`

**Request Body (Partial):**

```json
{
  "fields": [...],
  "prompt": "Updated prompt..."
}
```

---

### 5. **Delete Configuration** - Delete config

**Endpoint:** `DELETE /api/configs/[id]`

**Response (200):**

```json
{
  "message": "Config deleted successfully"
}
```

---

## 🧪 Postman Setup Guide

### **Step 1: Get Your Config ID**

First, call `GET /api/configs` to get your configuration ID:

```
GET http://localhost:3000/api/configs
```

Copy the `id` from the response.

### **Step 2: Convert Image to Base64**

**Option A: Using Online Tool**
- Go to https://base64.guru/converter/encode/image
- Upload your image
- Copy the base64 string
- Add prefix: `data:image/jpeg;base64,` (or `data:image/png;base64,`)

**Option B: Using JavaScript (Browser Console)**
```javascript
// In browser console
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.onchange = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();
  reader.onload = (event) => {
    console.log(event.target.result); // Copy this
  };
  reader.readAsDataURL(file);
};
fileInput.click();
```

**Option C: Using Node.js**
```javascript
const fs = require('fs');
const imageBuffer = fs.readFileSync('invoice.jpg');
const base64 = imageBuffer.toString('base64');
const dataUrl = `data:image/jpeg;base64,${base64}`;
console.log(dataUrl);
```

### **Step 3: Create Postman Request**

1. **Method:** `POST`
2. **URL:** `http://localhost:3000/api/ocr/run`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):**
   ```json
   {
     "configId": "paste-your-config-id-here",
     "imageData": "data:image/jpeg;base64,paste-base64-here",
     "fileType": "image/jpeg"
   }
   ```

### **Step 4: Send Request**

Click "Send" and you'll get the OCR results!

---

## 📝 Example Postman Collection (JSON)

Save this as `OCR_Config_Studio.postman_collection.json`:

```json
{
  "info": {
    "name": "OCR Config Studio API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Run OCR - Image",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"configId\": \"your-config-id\",\n  \"imageData\": \"data:image/jpeg;base64,/9j/4AAQSkZJRg...\",\n  \"fileType\": \"image/jpeg\"\n}"
        },
        "url": {
          "raw": "http://localhost:3000/api/ocr/run",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "ocr", "run"]
        }
      }
    },
    {
      "name": "List Configs",
      "request": {
        "method": "GET",
        "url": {
          "raw": "http://localhost:3000/api/configs",
          "protocol": "http",
          "host": ["localhost"],
          "port": "3000",
          "path": ["api", "configs"]
        }
      }
    }
  ]
}
```

---

## 🔑 Quick Test Example

**1. Get Config ID:**
```bash
curl http://localhost:3000/api/configs
```

**2. Run OCR (replace with your values):**
```bash
curl -X POST http://localhost:3000/api/ocr/run \
  -H "Content-Type: application/json" \
  -d '{
    "configId": "your-config-uuid",
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "fileType": "image/jpeg"
  }'
```

---

## ⚠️ Important Notes

1. **Base64 Size Limit**: Large images may exceed API limits. Keep images under 10MB.
2. **Config ID**: You must have a valid config ID. Create one via `POST /api/configs` first.
3. **File Types Supported**: 
   - Images: `image/jpeg`, `image/png`, `image/webp`
   - Documents: `application/pdf`
4. **Response Time**: OCR processing takes 5-15 seconds depending on document complexity.

---

## 🎯 Common Use Cases

### **Test with Sample Invoice Image**
1. Get config ID from `/api/configs`
2. Convert invoice image to base64
3. POST to `/api/ocr/run` with configId and imageData
4. Get structured JSON response

### **Process Multiple Documents**
- Use the same configId for multiple requests
- Each request creates a new `ocr_runs` record in database
- Track all runs via `runId` in response

---

**Ready to test!** Import the collection or create requests manually in Postman! 🚀

