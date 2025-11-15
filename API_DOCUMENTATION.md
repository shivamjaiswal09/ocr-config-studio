# PDF Template Engine API Documentation

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### 2. Fetch Template Configuration
Retrieves the most appropriate template based on hierarchical matching.

```http
GET /api/pdf-template?document_type={type}&consignor_id={id}&transporter_id={id}
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| document_type | string | Yes | Type of document (invoice, epod, gate_pass) |
| consignor_id | string | No | Consignor identifier |
| transporter_id | string | No | Transporter identifier |

**Template Priority:**
1. Consignor + Transporter specific
2. Consignor only
3. Global (default fallback)

**Response:**
```json
{
  "template_id": "uuid",
  "template_name": "HRI Invoice Template",
  "document_type": "invoice",
  "consignor_id": "HRI",
  "transporter_id": "UNION",
  "version": 1,
  "config": {
    "layout": { ... },
    "header": { ... },
    "sections": [ ... ],
    "charges": { ... },
    "footer": { ... }
  }
}
```

---

### 3. Generate PDF
Generates a PDF document based on template configuration and provided data.

```http
POST /api/pdf-template/generate
```

**Request Body:**
```json
{
  "document_type": "invoice",
  "consignor_id": "HRI",
  "transporter_id": "UNION",
  "template_id": "optional-uuid",
  "payload": {
    "invoice_number": "INV-17575",
    "invoice_date": "2024-01-15",
    "trip_id": "36369289",
    "vehicle_number": "MH12AB1234",
    "consignor_name": "ABC Manufacturing",
    "consignee_name": "XYZ Retail",
    "freight_charge": 7534.00,
    "cgst": 676.53,
    "sgst": 676.53,
    "total_amount": 9887.06,
    ...
  }
}
```

**Response:**
```json
{
  "pdf_url": "http://localhost:3000/outputs/invoice_abc123.pdf",
  "template_id": "uuid",
  "generated_at": "2024-01-15T10:30:00.000Z"
}
```

---

### 4. List Templates
Retrieves all templates, optionally filtered by document type.

```http
GET /api/pdf-template/list?document_type={type}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "template_name": "Default Invoice",
    "document_type": "invoice",
    "consignor_id": null,
    "transporter_id": null,
    "version": 1,
    "is_active": true,
    "config_json": { ... },
    "created_at": "2024-01-15T10:00:00.000Z"
  }
]
```

---

### 5. Create Template
Creates a new template configuration.

```http
POST /api/pdf-template
```

**Request Body:**
```json
{
  "template_name": "HRI Custom Invoice",
  "document_type": "invoice",
  "consignor_id": "HRI",
  "transporter_id": "UNION",
  "created_by": "admin@example.com",
  "config_json": {
    "layout": {
      "pageSize": "A4",
      "margins": { "top": 50, "right": 50, "bottom": 50, "left": 50 }
    },
    "header": {
      "showLogo": true,
      "title": "FREIGHT INVOICE",
      "fields": [
        { "key": "invoice_number", "label": "Invoice Number", "visible": true },
        { "key": "invoice_date", "label": "Invoice Date", "visible": true }
      ]
    },
    "sections": [
      {
        "name": "from",
        "title": "From (Consignor)",
        "fields": [
          { "key": "consignor_name", "label": "Name", "visible": true },
          { "key": "consignor_address", "label": "Address", "visible": true }
        ]
      }
    ],
    "charges": {
      "items": [
        { "key": "freight_charge", "label": "Freight Charge", "visible": true },
        { "key": "cgst", "label": "CGST", "visible": true }
      ]
    },
    "footer": {
      "showBankDetails": true,
      "text": "This is a computer-generated invoice."
    }
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "template_name": "HRI Custom Invoice",
  "version": 1,
  ...
}
```

---

### 6. Update Template
Updates an existing template and increments version.

```http
PUT /api/pdf-template/:id
```

**Request Body:**
```json
{
  "config_json": { ... },
  "version_comment": "Added CGST/SGST breakdown",
  "updated_by": "admin@example.com"
}
```

---

### 7. Delete Template
Deletes a template (soft delete with audit log).

```http
DELETE /api/pdf-template/:id
```

**Request Body:**
```json
{
  "deleted_by": "admin@example.com"
}
```

---

### 8. Get Document Fields
Retrieves available fields for a document type.

```http
GET /api/document-fields/:document_type
```

**Response:**
```json
[
  {
    "id": "uuid",
    "document_type": "invoice",
    "field_key": "invoice_number",
    "field_label": "Invoice Number",
    "field_type": "text",
    "is_required": true,
    "description": "Unique invoice identifier"
  }
]
```

---

## Field Aliasing Example

You can rename any field in the template configuration:

```json
{
  "charges": {
    "items": [
      { "key": "freight_charge", "label": "Transport Charges", "visible": true }
    ]
  }
}
```

The PDF will display "Transport Charges" instead of "Freight Charge".

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

**Common Status Codes:**
- `400` - Bad Request (missing parameters)
- `404` - Template not found
- `500` - Internal server error

---

## Sample Invoice Payload

```json
{
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
  "cgst": 676.53,
  "sgst": 676.53,
  "igst": 0,
  "total_amount": 9887.06,
  "bank_details": "Bank: HDFC Bank\\nAccount: 50200012345678\\nIFSC: HDFC0001234"
}
```

---

## Integration Example

### Node.js / JavaScript

```javascript
const axios = require('axios');

async function generateInvoice(data) {
  const response = await axios.post('http://localhost:3000/api/pdf-template/generate', {
    document_type: 'invoice',
    consignor_id: 'HRI',
    transporter_id: 'UNION',
    payload: data
  });
  
  return response.data.pdf_url;
}
```

### Python

```python
import requests

def generate_invoice(data):
    response = requests.post('http://localhost:3000/api/pdf-template/generate', json={
        'document_type': 'invoice',
        'consignor_id': 'HRI',
        'transporter_id': 'UNION',
        'payload': data
    })
    
    return response.json()['pdf_url']
```

---

## Audit Logging

All template operations (CREATE, UPDATE, DELETE, GENERATE) are automatically logged in the `audit_logs` table with:
- Template ID
- Action type
- User ID
- Metadata (context)
- Timestamp

