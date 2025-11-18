# `/api/configs` Endpoint Documentation

## Base URL
```
https://ocr-config-studio-arix2eb37-shivam-jaiswals-projects-f104f298.vercel.app/api/configs
```

## GET `/api/configs` - List OCR Configurations

### Description
Retrieves a list of OCR configurations, optionally filtered by document type, company ID, or transporter company ID.

### Request

**Method:** `GET`

**Query Parameters (all optional):**
- `documentType` - Filter by document type (e.g., "Freight Invoice")
- `companyId` - Filter by company ID
- `transporterCompanyId` - Filter by transporter company ID

### Examples

**Get all configs:**
```bash
GET https://ocr-config-studio-arix2eb37-shivam-jaiswals-projects-f104f298.vercel.app/api/configs
```

**Filter by document type:**
```bash
GET https://ocr-config-studio-arix2eb37-shivam-jaiswals-projects-f104f298.vercel.app/api/configs?documentType=Freight%20Invoice
```

**Filter by company ID:**
```bash
GET https://ocr-config-studio-arix2eb37-shivam-jaiswals-projects-f104f298.vercel.app/api/configs?companyId=CNR-001
```

**Multiple filters:**
```bash
GET https://ocr-config-studio-arix2eb37-shivam-jaiswals-projects-f104f298.vercel.app/api/configs?documentType=Freight%20Invoice&companyId=CNR-001
```

### Response

**Success (200):**
```json
[
  {
    "id": "uuid-here",
    "document_type": "Freight Invoice",
    "company_id": "CNR-001",
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
    "prompt": "Extract invoice data...",
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
]
```

**Error (500):**
```json
{
  "error": "Failed to fetch configs",
  "details": "Error message here"
}
```

---

## POST `/api/configs` - Create New Configuration

### Description
Creates a new OCR configuration.

### Request

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "document_type": "Freight Invoice",
  "company_id": "CNR-001",
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
    },
    {
      "field_label": "Base Freight",
      "field_key": "base_freight",
      "data_type": "number",
      "required": true,
      "payload_mapping_key": null
    }
  ],
  "prompt": "Extract all information from this freight invoice document..."
}
```

### Response

**Success (201):**
```json
{
  "id": "uuid-here",
  "document_type": "Freight Invoice",
  "company_id": "CNR-001",
  "apply_at_transporter_level": false,
  "transporter_company_id": null,
  "fields": [...],
  "prompt": "...",
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-01-15T10:30:00Z"
}
```

**Error (400):**
```json
{
  "error": "company_id is required"
}
```

**Error (409):**
```json
{
  "error": "Config already exists",
  "details": "A configuration with this document_type, company_id, and transporter_company_id already exists"
}
```

---

## Testing with cURL

**GET all configs:**
```bash
curl https://ocr-config-studio-arix2eb37-shivam-jaiswals-projects-f104f298.vercel.app/api/configs
```

**POST new config:**
```bash
curl -X POST https://ocr-config-studio-arix2eb37-shivam-jaiswals-projects-f104f298.vercel.app/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "Freight Invoice",
    "company_id": "CNR-001",
    "apply_at_transporter_level": false,
    "fields": [
      {
        "field_label": "Invoice Number",
        "field_key": "invoice_number",
        "data_type": "string",
        "required": true,
        "payload_mapping_key": "invoice_number"
      }
    ],
    "prompt": "Extract invoice data"
  }'
```

---

## Notes

- Results are ordered by `created_at` descending (newest first)
- If Supabase is not configured, the endpoint will return an empty array `[]` (no error)
- The endpoint supports filtering but all filters are optional
- Each configuration must have a unique combination of `document_type`, `company_id`, and `transporter_company_id`

