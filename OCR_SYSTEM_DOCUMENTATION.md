# 🔍 OCR Template Configuration System - Complete Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Installation & Setup](#installation--setup)
4. [Template Configuration](#template-configuration)
5. [API Documentation](#api-documentation)
6. [Frontend UI Usage](#frontend-ui-usage)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The **OCR Template Configuration System** enables you to configure OCR extraction templates for freight documents (invoices, POD, LR, etc.) and extract structured data using OpenAI's Vision API.

### Key Features

✅ **Template Studio UI**: Create and manage OCR templates via a web interface  
✅ **Template Versioning**: Track versions, publish, deprecate, and rollback templates  
✅ **Field Configuration**: Define canonical fields, synonyms, bounding boxes, and validation rules  
✅ **OpenAI Vision Integration**: Automatic OCR extraction with GPT-4o-mini  
✅ **Data Normalization**: Auto-normalize dates, currencies, and numeric values  
✅ **Vendor Response Storage**: Store all OCR responses for debugging and audit  
✅ **Performance Metrics**: Track latency, token usage, and accuracy per template  

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Admin UI                       │
│          (Template Studio - Create/Edit/List)          │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP REST API
┌────────────────────▼────────────────────────────────────┐
│                  Express Backend                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  OCR Template CRUD Controller                    │  │
│  │  - Create, Read, Update, Delete Templates        │  │
│  │  - Publish, Deprecate, Clone Templates           │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  OCR Extraction Controller                       │  │
│  │  - POST /ocr/extract                             │  │
│  │  - Template Lookup → Payload Builder → OpenAI   │  │
│  └──────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 PostgreSQL Database                     │
│  - ocr_templates                                        │
│  - vendor_ocr_responses                                 │
│  - ocr_template_audit                                   │
└─────────────────────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              OpenAI Vision API                          │
│              (gpt-4o-mini / gpt-4o)                     │
└─────────────────────────────────────────────────────────┘
```

---

## Installation & Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL 14+
- OpenAI API Key

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/freight_tms
OPENAI_API_KEY=sk-proj-YOUR_OPENAI_API_KEY_HERE
PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

### 3. Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd admin-ui
npm install
cd ..
```

### 4. Database Setup

Run the OCR schema migration:

```bash
npm run migrate
```

This will create:
- `ocr_templates` table
- `vendor_ocr_responses` table
- `ocr_template_audit` table
- Sample template for testing

### 5. Start Services

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Admin UI:**
```bash
npm run admin
```

**Access Points:**
- Backend API: `http://localhost:3000`
- Admin UI: `http://localhost:3001`
- OCR Template Studio: `http://localhost:3001/ocr-templates`

---

## Template Configuration

### Template Structure

An OCR template consists of:

#### 1. **General Information**
- `template_name`: Descriptive name (e.g., "Standard Freight Invoice Template")
- `client_id`: Client identifier (e.g., "CLIENT_A")
- `branch_id`: Branch identifier (e.g., "BRANCH_7")
- `transporter_id`: Transporter identifier (e.g., "TRANS_XYZ")
- `doc_type`: Document type (`invoice`, `pod`, `lr`, `gate_pass`, `receipt`)

#### 2. **Canonical Fields**
Fields you want to extract from the document:

```json
{
  "canonical_fields": [
    "invoice_number",
    "invoice_date",
    "freight_value",
    "gst_amount",
    "total_amount"
  ]
}
```

#### 3. **Field Metadata**
For each field, configure:

```json
{
  "canonical": "freight_value",
  "synonyms": ["Base Freight", "Freight Charge", "Transportation Charges"],
  "bounding_box": {
    "x": 0.70,
    "y": 0.82,
    "w": 0.25,
    "h": 0.08
  },
  "data_type": "number",
  "required": true
}
```

**Data Types:**
- `string`: Text values
- `number`: Numeric values (auto-cleaned of currency symbols)
- `date`: Dates (auto-normalized to YYYY-MM-DD)
- `boolean`: True/false values
- `array`: List of values

**Bounding Boxes (Optional):**
- Normalized coordinates (0-1 scale)
- Helps AI focus on specific document regions
- Format: `{x, y, w, h}` where x=left, y=top, w=width, h=height

#### 4. **Extraction Rules**

```json
{
  "rules": {
    "currency_hint": "INR",
    "date_formats": ["DD-MM-YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
    "positional_cues": "Look for amounts in the bottom-right section. GST details appear above total."
  }
}
```

#### 5. **Few-shot Examples**

```json
{
  "few_shots": [
    {
      "description": "Standard freight invoice format",
      "example_output": {
        "invoice_number": "INV-2025-001234",
        "invoice_date": "2025-01-15",
        "freight_value": 12000,
        "gst_amount": 2160,
        "total_amount": 14160
      }
    }
  ]
}
```

---

## API Documentation

### Template CRUD APIs

#### 1. List Templates
```http
GET /api/ocr/templates?client_id=CLIENT_A&status=published&page=1&limit=20
```

**Query Parameters:**
- `client_id`, `branch_id`, `transporter_id`, `doc_type`, `status`
- `search`: Search by template name
- `page`, `limit`: Pagination

**Response:**
```json
{
  "status": "success",
  "data": {
    "templates": [...],
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

#### 2. Get Template by ID
```http
GET /api/ocr/templates/:id
```

#### 3. Create Template
```http
POST /api/ocr/templates
Content-Type: application/json

{
  "template_name": "Standard Invoice Template",
  "client_id": "CLIENT_A",
  "branch_id": "BRANCH_7",
  "transporter_id": "TRANS_XYZ",
  "doc_type": "invoice",
  "template_json": { ... },
  "created_by": "admin"
}
```

#### 4. Update Template (Draft Only)
```http
PUT /api/ocr/templates/:id
Content-Type: application/json

{
  "template_name": "Updated Name",
  "template_json": { ... },
  "performed_by": "admin"
}
```

#### 5. Publish Template
```http
POST /api/ocr/templates/:id/publish
Content-Type: application/json

{
  "performed_by": "admin"
}
```

#### 6. Deprecate Template
```http
POST /api/ocr/templates/:id/deprecate
```

#### 7. Clone Template
```http
POST /api/ocr/templates/:id/clone
```

#### 8. Delete Template (Draft Only)
```http
DELETE /api/ocr/templates/:id
```

---

### OCR Extraction API

#### POST /api/ocr/extract

**Request:**
```http
POST /api/ocr/extract
Content-Type: application/json

{
  "document_url": "https://example.com/invoice.jpg",
  "client_id": "CLIENT_A",
  "branch_id": "BRANCH_7",
  "transporter_id": "TRANS_XYZ",
  "doc_type": "invoice"
}
```

**Or with Base64 image:**
```json
{
  "document_url": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "client_id": "CLIENT_A",
  "branch_id": "BRANCH_7",
  "transporter_id": "TRANS_XYZ",
  "doc_type": "invoice"
}
```

**Processing Pipeline:**

1. **Template Lookup**: Fetch latest published template matching context
2. **Payload Building**: Convert template to instruction payload
3. **OpenAI Vision Call**: Send image + instructions to GPT-4o-mini
4. **Normalization**: Clean data (remove symbols, format dates/numbers)
5. **Validation**: Check required fields
6. **Storage**: Store raw + normalized response

**Response (Success):**
```json
{
  "status": "success",
  "canonical": {
    "invoice_number": "INV-2025-001234",
    "invoice_date": "2025-01-15",
    "freight_value": 12000,
    "additional_charges": 500,
    "gst_amount": 2250,
    "total_amount": 14750,
    "lr_number": "LR-2025-5678",
    "consignor_name": "ABC Industries Ltd",
    "consignee_name": "XYZ Retail Pvt Ltd",
    "vehicle_number": "MH12AB1234"
  },
  "template_id": "550e8400-e29b-41d4-a716-446655440000",
  "latency_ms": 1847,
  "request_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response (Error):**
```json
{
  "status": "error",
  "error": "no_template_found",
  "message": "No published template found for...",
  "request_id": "..."
}
```

#### GET /api/ocr/extract/:requestId

Retrieve a previous extraction result by request ID.

#### GET /api/ocr/templates/:templateId/stats

Get performance statistics for a template:

```json
{
  "status": "success",
  "data": {
    "total_requests": 1250,
    "success_count": 1180,
    "error_count": 70,
    "avg_latency_ms": 1847,
    "avg_tokens": 1850
  }
}
```

---

## Frontend UI Usage

### Template Studio Workflow

#### 1. Create New Template

1. Navigate to **http://localhost:3001/ocr-templates**
2. Click **"+ New Template"**
3. Fill in general information:
   - Template Name
   - Client ID, Branch ID, Transporter ID
   - Document Type

4. Configure fields:
   - Add canonical field names
   - Add synonyms (comma-separated)
   - Set data type (string/number/date/boolean)
   - Mark as required if needed
   - Optionally add bounding box hints

5. Set extraction rules:
   - Currency hint (e.g., INR)
   - Date formats
   - Positional cues

6. Add few-shot examples (JSON format)

7. Click **"Create Template"** (status: DRAFT)

#### 2. Publish Template

1. Go to template list
2. Find your draft template
3. Click **"Publish"**
4. This will:
   - Set status to PUBLISHED
   - Deprecate any other published version for same context
   - Make it active for OCR extraction

#### 3. Edit Template

- Only DRAFT templates can be edited
- PUBLISHED/DEPRECATED templates are read-only
- Clone a published template to create a new editable version

#### 4. Version Management

- Each context (client + branch + transporter + doc_type) can have multiple versions
- Only the latest PUBLISHED template is used for extraction
- Use CLONE to create a new version from an existing template

---

## Production Deployment

### Environment Variables (Production)

```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db.example.com:5432/freight_tms
OPENAI_API_KEY=sk-proj-PRODUCTION_KEY_HERE
PORT=3000
NEXT_PUBLIC_API_URL=https://api.yourcompany.com/api
```

### Database Migration

```bash
npm run migrate
```

### Build & Start

```bash
# Build backend
npm run build
npm start

# Build admin UI
cd admin-ui
npm run build
npm start
```

### Docker Deployment (Optional)

```bash
docker-compose up -d
```

### Performance Optimization

1. **Caching**: Cache templates in memory (Redis)
2. **Batch API**: Use OpenAI Batch API for 50% cost savings
3. **Model Selection**:
   - `gpt-4o-mini`: Fast, cheap (~₹0.04/invoice)
   - `gpt-4o`: Higher accuracy, slower, more expensive (~₹0.30/invoice)

---

## Troubleshooting

### Common Issues

#### 1. "no_template_found" error

**Cause**: No published template matches the context.

**Solution:**
- Verify client_id, branch_id, transporter_id, doc_type match exactly
- Check template status is PUBLISHED
- View templates in UI to confirm

#### 2. OpenAI API Timeout

**Cause**: Large images or slow API response.

**Solution:**
- Reduce image size (< 5MB recommended)
- Increase timeout in `openAIVisionService.ts` (default: 60s)
- Use `detail: 'low'` for faster processing

#### 3. Missing Required Fields

**Cause**: AI couldn't extract all required fields.

**Solution:**
- Add more synonyms for the field
- Add bounding box hints
- Improve few-shot examples
- Add positional cues
- Check document quality

#### 4. Incorrect Data Extraction

**Cause**: Template not optimized for document format.

**Solution:**
- Clone template and create a new version
- Add document-specific synonyms
- Update few-shot examples with actual document format
- Add bounding boxes for critical fields

### Debugging Tools

1. **Vendor Response Storage**: All responses stored in `vendor_ocr_responses` table
   ```sql
   SELECT * FROM vendor_ocr_responses 
   WHERE request_id = 'REQUEST_ID';
   ```

2. **Template Audit Log**: Track all template changes
   ```sql
   SELECT * FROM ocr_template_audit 
   WHERE template_id = 'TEMPLATE_ID' 
   ORDER BY created_at DESC;
   ```

3. **Template Stats**: View performance metrics in UI or via API

---

## Cost Estimation

### OpenAI Pricing (as of 2025)

| Model | Input (₹/1M tokens) | Output (₹/1M tokens) | Est. Cost/Invoice |
|-------|---------------------|----------------------|-------------------|
| gpt-4o-mini | ₹0.02 | ₹0.08 | ~₹0.04-0.08 |
| gpt-4o | ₹2.50 | ₹10.00 | ~₹0.20-0.40 |

**Assumptions:**
- 1000-1500 input tokens per invoice image
- 300-500 output tokens per extraction
- Rates converted at ₹83/USD

**Monthly Volume Estimates:**

| Invoices/Month | Model | Monthly Cost (₹) |
|----------------|-------|------------------|
| 10,000 | gpt-4o-mini | ~600-800 |
| 10,000 | gpt-4o | ~3,000-4,000 |
| 100,000 | gpt-4o-mini | ~6,000-8,000 |
| 100,000 | gpt-4o | ~30,000-40,000 |

---

## Support & Contribution

For issues or feature requests, contact the development team.

### Database Schema Reference

See `src/db/ocr-schema.sql` for complete schema definitions.

### TypeScript Types

See `src/types/ocr.types.ts` for all interface definitions.

---

**Last Updated**: 2025-11-14  
**Version**: 1.0.0

