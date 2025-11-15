# 📄 OCR Template Configuration System - Complete Guide

## Overview

A production-grade OCR Template Configuration System for freight documents (invoices, PODs, LRs) with OpenAI Vision integration.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                         │
│  - Template List Page (filters, search, pagination)         │
│  - Template Builder (create/edit with all configs)          │
│  - Status management (Draft → Published → Deprecated)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     BACKEND (Express)                        │
│  - Template CRUD APIs                                        │
│  - Template Resolution Logic                                │
│  - OCR Extraction Pipeline                                  │
│  - Vendor Response Storage                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   SERVICES LAYER                             │
│  - OCR Template Service (CRUD, versioning, audit)           │
│  - Instruction Payload Builder                              │
│  - OpenAI Vision Service (extraction, normalization)        │
│  - Vendor Response Service (storage, stats)                 │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                      │
│  - ocr_templates                                             │
│  - ocr_template_audit                                       │
│  - vendor_ocr_responses                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy environment variables
cp .env.example .env

# Edit .env and add your OpenAI API key
OPENAI_API_KEY=sk-proj-your-key-here
```

### 2. Install Dependencies

```bash
# Backend
npm install

# Frontend
cd admin-ui
npm install
cd ..
```

### 3. Setup Database

```bash
# Run migrations
npm run migrate
```

This creates:
- `ocr_templates` - Template configurations
- `ocr_template_audit` - Audit trail
- `vendor_ocr_responses` - OCR API response logs

### 4. Start Services

```bash
# Terminal 1: Backend API
npm run dev

# Terminal 2: Admin UI
npm run admin
```

**URLs:**
- Backend API: `http://localhost:3000`
- Admin UI: `http://localhost:3001`
- Health check: `http://localhost:3000/health`

---

## 📋 Template Configuration Guide

### Template Studio UI

Navigate to: `http://localhost:3001/ocr-templates`

#### Creating a New Template

1. **General Information**
   - Template Name: Descriptive name (e.g., "ACME Corp Invoice Template")
   - Client ID: Consignor identifier
   - Branch ID: Branch/location identifier
   - Transporter ID: Transporter identifier
   - Document Type: invoice | pod | lr | gate_pass | receipt

2. **Field Configuration**
   
   For each field, define:
   
   **Canonical Name**: Standard FT field name
   - `invoice_number`, `invoice_date`, `freight_value`, etc.
   
   **Synonyms**: Document label variations
   - Invoice Number → ["Invoice No", "Bill No", "Invoice #"]
   - Freight Value → ["Base Freight", "Transportation Charges"]
   
   **Data Type**: string | number | date | boolean | array
   
   **Required**: Whether field is mandatory
   
   **Bounding Box** (optional): Position hints (normalized 0-1)
   ```json
   {
     "x": 0.70,  // 70% from left
     "y": 0.82,  // 82% from top
     "w": 0.25,  // 25% width
     "h": 0.08   // 8% height
   }
   ```

3. **Extraction Rules**
   
   **Currency Hint**: INR, USD, EUR (for normalization)
   
   **Date Formats**: Document date formats
   - ["DD-MM-YYYY", "DD/MM/YYYY", "YYYY-MM-DD"]
   
   **Positional Cues**: Free-text hints
   - "Look for amounts in bottom-right section"
   - "Invoice number is always in top-right corner"

4. **Few-shot Examples**
   
   Provide example outputs to guide the AI:
   
   ```json
   {
     "description": "Standard freight invoice",
     "example_output": {
       "invoice_number": "INV-2025-001234",
       "invoice_date": "2025-01-15",
       "freight_value": 12000,
       "gst_amount": 2160,
       "total_amount": 14160
     }
   }
   ```

5. **Save as Draft**
   
   Templates start as **Draft** → can be edited and tested.

6. **Publish Template**
   
   When ready:
   - Click **Publish** in template list
   - Template becomes active for OCR extraction
   - Previous published version auto-deprecated
   - Published templates are **read-only**

---

## 🔌 API Usage

### 1. OCR Extraction Endpoint

**POST** `/api/ocr/extract`

**Request:**
```json
{
  "document_url": "https://example.com/invoice.jpg",
  "client_id": "CLIENT_A",
  "branch_id": "BRANCH_7",
  "transporter_id": "TRANS_XYZ",
  "doc_type": "invoice"
}
```

**Or with base64 image:**
```json
{
  "document_url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "client_id": "CLIENT_A",
  "branch_id": "BRANCH_7",
  "transporter_id": "TRANS_XYZ",
  "doc_type": "invoice"
}
```

**Response (Success):**
```json
{
  "status": "success",
  "canonical": {
    "invoice_number": "INV-2025-001234",
    "invoice_date": "2025-01-15",
    "freight_value": 12000,
    "additional_charges": 350,
    "gst_amount": 2160,
    "total_amount": 14510
  },
  "template_id": "550e8400-e29b-41d4-a716-446655440000",
  "latency_ms": 1180,
  "request_id": "req_abc123"
}
```

**Response (No Template Found):**
```json
{
  "status": "error",
  "error": "no_template_found",
  "message": "No published template found for client=CLIENT_A, branch=BRANCH_7, transporter=TRANS_XYZ, doc_type=invoice",
  "request_id": "req_xyz789"
}
```

### 2. Template Management APIs

#### List Templates
```bash
GET /api/ocr/templates?client_id=CLIENT_A&status=published&page=1&limit=20
```

#### Get Template by ID
```bash
GET /api/ocr/templates/{id}
```

#### Create Template
```bash
POST /api/ocr/templates
Content-Type: application/json

{
  "template_name": "ACME Invoice Template",
  "client_id": "CLIENT_A",
  "branch_id": "BRANCH_7",
  "transporter_id": "TRANS_XYZ",
  "doc_type": "invoice",
  "template_json": {
    "canonical_fields": ["invoice_number", "invoice_date", "freight_value"],
    "field_metadata": [ ... ],
    "rules": { ... },
    "few_shots": [ ... ]
  }
}
```

#### Update Template (Draft only)
```bash
PUT /api/ocr/templates/{id}
Content-Type: application/json

{
  "template_name": "Updated Name",
  "template_json": { ... }
}
```

#### Publish Template
```bash
POST /api/ocr/templates/{id}/publish
```

#### Deprecate Template
```bash
POST /api/ocr/templates/{id}/deprecate
```

#### Clone Template
```bash
POST /api/ocr/templates/{id}/clone
```

#### Get Audit History
```bash
GET /api/ocr/templates/{id}/audit
```

#### Get Template Performance Stats
```bash
GET /api/ocr/templates/{templateId}/stats

Response:
{
  "total_requests": 1250,
  "success_count": 1180,
  "error_count": 70,
  "avg_latency_ms": 1420,
  "avg_tokens": 1850
}
```

#### Get Extraction Result by Request ID
```bash
GET /api/ocr/extract/{requestId}
```

---

## 📊 Template Versioning & Lifecycle

### State Machine

```
┌────────┐  publish   ┌───────────┐  deprecate  ┌────────────┐
│ DRAFT  │ ────────→  │ PUBLISHED │ ─────────→  │ DEPRECATED │
└────────┘            └───────────┘             └────────────┘
    │                       │                          │
    └─ editable             └─ read-only               └─ read-only
    └─ deletable           └─ active for OCR          └─ archived
```

### Versioning Rules

1. **Template Resolution**: System fetches the latest **published** template matching `(client_id, branch_id, transporter_id, doc_type)`

2. **Publishing**: When you publish a template:
   - Previous published version → auto-deprecated
   - New template becomes active
   - Version number increments

3. **Rollback**: Clone any previous version to create a new draft

4. **Audit Trail**: Every action (CREATE, UPDATE, PUBLISH, DEPRECATE, ROLLBACK) is logged

---

## 🧪 Testing the System

### Test Script (cURL)

```bash
# 1. Create a test template
curl -X POST http://localhost:3000/api/ocr/templates \
  -H "Content-Type: application/json" \
  -d '{
    "template_name": "Test Invoice Template",
    "client_id": "TEST",
    "branch_id": "MAIN",
    "transporter_id": "TX001",
    "doc_type": "invoice",
    "template_json": {
      "canonical_fields": ["invoice_number", "invoice_date", "total_amount"],
      "field_metadata": [
        {
          "canonical": "invoice_number",
          "synonyms": ["Invoice No", "Bill No"],
          "bounding_box": null,
          "data_type": "string",
          "required": true
        },
        {
          "canonical": "invoice_date",
          "synonyms": ["Date", "Invoice Date"],
          "bounding_box": null,
          "data_type": "date",
          "required": true
        },
        {
          "canonical": "total_amount",
          "synonyms": ["Total", "Amount"],
          "bounding_box": null,
          "data_type": "number",
          "required": true
        }
      ],
      "rules": {
        "currency_hint": "INR",
        "date_formats": ["DD-MM-YYYY"]
      },
      "few_shots": []
    }
  }'

# 2. Publish template (use ID from step 1 response)
curl -X POST http://localhost:3000/api/ocr/templates/{TEMPLATE_ID}/publish

# 3. Test OCR extraction with base64 image
curl -X POST http://localhost:3000/api/ocr/extract \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://example.com/invoice.jpg",
    "client_id": "TEST",
    "branch_id": "MAIN",
    "transporter_id": "TX001",
    "doc_type": "invoice"
  }'
```

---

## 🔍 Data Normalization

The system automatically normalizes extracted data:

### Number Normalization
- **Input**: `"12,000 ₹"`, `"$1,500"`, `"€ 2.500,00"`
- **Output**: `12000`, `1500`, `2500`
- Removes: Currency symbols, commas, spaces

### Date Normalization
- **Input**: `"15-01-2025"`, `"2025/01/15"`, `"15.01.25"`
- **Output**: `"2025-01-15"` (YYYY-MM-DD)
- Handles: Multiple formats, 2-digit years

### String Normalization
- Trims whitespace
- Returns `null` for empty values

### Missing Fields
- Returns `null` for fields not found in document

---

## 📈 Monitoring & Debugging

### Vendor Response Storage

Every OCR request is logged in `vendor_ocr_responses`:

```sql
SELECT 
  request_id,
  template_id,
  status,
  latency_ms,
  token_usage,
  created_at
FROM vendor_ocr_responses
WHERE template_id = 'xxx'
ORDER BY created_at DESC
LIMIT 50;
```

### Check Template Performance

```bash
GET /api/ocr/templates/{templateId}/stats
```

### Audit Trail

```bash
GET /api/ocr/templates/{templateId}/audit
```

---

## 🏗️ System Architecture Details

### Backend Services

**File Structure:**
```
src/
├── controllers/
│   ├── ocrController.ts           # OCR extraction endpoint
│   └── ocrTemplateController.ts   # Template CRUD
├── services/
│   ├── ocrTemplateService.ts      # Template business logic
│   ├── instructionPayloadBuilder.ts # Builds OpenAI prompts
│   ├── openAIVisionService.ts     # Vision API integration
│   └── vendorResponseService.ts   # Response storage
├── types/
│   └── ocr.types.ts               # TypeScript interfaces
├── db/
│   ├── connection.ts              # PostgreSQL pool
│   └── schema.sql                 # Database schema
└── routes/
    └── index.ts                   # API routes
```

### Frontend Structure

```
admin-ui/app/
└── ocr-templates/
    ├── page.tsx              # List view
    ├── new/
    │   └── page.tsx          # Create template
    └── [id]/
        └── edit/
            └── page.tsx      # Edit/view template
```

---

## 🔧 Configuration Options

### Template JSON Structure

```typescript
{
  canonical_fields: string[];           // List of field names
  field_metadata: FieldMetadata[];      // Field details
  rules: {
    currency_hint: string;              // Currency for normalization
    date_formats: string[];             // Expected date formats
    positional_cues?: string;           // Free-text hints
    table_detection?: boolean;          // Enable table parsing
    multi_page?: boolean;               // Multi-page document
  };
  few_shots: FewShotExample[];         // Example outputs
}
```

### Field Metadata Options

```typescript
{
  canonical: string;                   // FT-standard field name
  synonyms: string[];                  // Label variations
  bounding_box: {                      // Position hint (optional)
    x: number;    // 0-1 (left)
    y: number;    // 0-1 (top)
    w: number;    // 0-1 (width)
    h: number;    // 0-1 (height)
  } | null;
  data_type: 'string' | 'number' | 'date' | 'boolean' | 'array';
  required: boolean;
  validation_rules?: {                 // Optional validation
    regex?: string;
    min?: number;
    max?: number;
    enum?: string[];
  };
}
```

---

## 💰 OpenAI Cost Optimization

### Model Selection

Current: `gpt-4o-mini` (~₹0.04-0.08 per invoice)

For higher accuracy: Switch to `gpt-4o` in `src/services/instructionPayloadBuilder.ts:50`

### Token Usage Tracking

Every response logs token usage:
```json
{
  "token_usage": {
    "input": 1200,
    "output": 450
  }
}
```

### Cost Estimates (per invoice)
- **gpt-4o-mini**: ₹0.04-0.08
- **gpt-4o**: ₹0.20-0.30
- **GPT-5 nano**: ₹0.03

---

## 🚨 Error Handling

### Common Errors

**No Template Found**
```json
{
  "status": "error",
  "error": "no_template_found"
}
```
→ Create and publish a template for that client/branch/transporter/doc_type

**Invalid Template**
```json
{
  "status": "error",
  "error": "invalid_template",
  "errors": ["canonical_fields cannot be empty"]
}
```
→ Fix template configuration

**OpenAI API Failure**
```json
{
  "status": "error",
  "error": "OpenAI API error: 401 - Invalid API key"
}
```
→ Check OPENAI_API_KEY in .env

**Cannot Edit Published Template**
```json
{
  "status": "error",
  "error": "Cannot update published template. Create a new version instead."
}
```
→ Clone the template to create a new draft

---

## 🔐 Security Considerations

1. **API Key**: Store OPENAI_API_KEY in environment variables
2. **Document URLs**: Use signed URLs for S3/cloud storage
3. **Base64 Data**: Large base64 images are not stored in `vendor_ocr_responses.document_url`
4. **Template Access**: Add authentication/authorization as needed
5. **Rate Limiting**: Implement rate limits for `/ocr/extract` endpoint

---

## 📚 Next Steps (Phase 2)

1. **Auto Template Detection**: Infer template from document without explicit context
2. **LLM Fallback**: Use GPT-4 for complex/unclear documents
3. **Confidence Scores**: Return confidence per field
4. **Human-in-the-Loop**: Flag low-confidence extractions for review
5. **Batch Processing**: Process multiple documents in parallel
6. **Template Analytics**: Track field extraction success rates
7. **A/B Testing**: Test multiple template variations

---

## 📞 Support

For issues or questions:
1. Check logs in backend terminal
2. Review `vendor_ocr_responses` table for failed requests
3. Check OpenAI API status
4. Verify database connectivity

---

## ✅ System Checklist

- [x] PostgreSQL database with schema
- [x] TypeScript types and interfaces
- [x] Template CRUD service
- [x] Instruction payload builder
- [x] OpenAI Vision integration
- [x] Data normalization
- [x] Vendor response storage
- [x] Template versioning & audit
- [x] OCR extraction endpoint
- [x] Template CRUD APIs
- [x] React Template List UI
- [x] React Template Builder UI
- [x] Template status management
- [x] Filters and search
- [x] Pagination
- [x] Error handling
- [x] Logging

**System Status: ✅ Production Ready**

