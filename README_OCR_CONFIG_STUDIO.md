# OCR Config Studio

A full-stack Next.js 14 application for managing OCR configurations and running document extraction with OpenAI.

## 🚀 Features

- **Config Management**: Create, edit, and delete OCR configurations per document type, company, and transporter
- **Field Configuration**: Define custom fields with data types, validation, and payload mapping
- **Run OCR**: Execute OCR on documents using OpenAI with saved configurations
- **Structured Output**: Get both raw JSON and mapped payload according to freight invoicing schema
- **Built for Vercel**: Single fullstack app ready for serverless deployment

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **UI**: React + Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **LLM**: OpenAI GPT-4o
- **Deployment**: Vercel

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js 18+** installed
2. **Supabase account** and project ([Create one](https://supabase.com))
3. **OpenAI API key** ([Get one](https://platform.openai.com/api-keys))

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd "/Users/admin/Desktop/PDF template"
npm install
```

### 2. Set Up Supabase

1. Go to your Supabase project
2. Run the SQL schema from `supabase-schema.sql` in the SQL Editor
3. Copy your project URL and service role key from Settings → API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here
```

**⚠️ Security Note**: Never commit `.env.local` to git. The service role key must stay server-side only.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project" and import your repository
4. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY

# Deploy to production
vercel --prod
```

## 📖 Usage Guide

### Creating an OCR Configuration

1. Go to the **Config Management** tab
2. Click **New Configuration**
3. Fill in:
   - **Document Type**: e.g., "Freight Invoice"
   - **Company ID**: The company this config belongs to
   - **Apply at Transporter Level**: Toggle if config is transporter-specific
   - **Transporter Company ID**: Required if transporter-level is enabled
   - **OpenAI Prompt**: Instructions for extraction
   - **Fields**: Define fields to extract with:
     - Field Label (display name)
     - Field Key (internal key)
     - Data Type (string, number, date, boolean, array)
     - Required flag
     - Example value (helps OCR accuracy)
     - Payload Mapping (maps to standard freight schema)
4. Click **Save Configuration**

### Running OCR

1. Go to the **Run OCR** tab
2. Select a configuration from the dropdown
3. Paste or type document text (or click "Load Sample" for demo)
4. Click **Run OCR**
5. View results in:
   - **Mapped Payload**: Structured data mapped to freight schema
   - **Raw JSON**: Complete extraction result

## 🗂 Project Structure

```
/
├── app/
│   ├── api/
│   │   ├── configs/         # Config CRUD endpoints
│   │   │   ├── route.ts     # GET, POST /api/configs
│   │   │   └── [id]/route.ts # PUT, DELETE /api/configs/[id]
│   │   └── ocr/
│   │       └── run/route.ts # POST /api/ocr/run
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Main page with tabs
│   └── globals.css          # Global styles
├── components/
│   ├── ConfigManagement.tsx # Config management UI
│   ├── RunOcr.tsx          # OCR execution UI
│   └── ui/                 # shadcn/ui components
├── lib/
│   ├── supabaseClient.ts   # Supabase client (server-side)
│   ├── openaiClient.ts     # OpenAI client
│   └── ocr/
│       ├── openaiOcr.ts    # OCR processing logic
│       └── mapping.ts      # Payload mapping helper
├── types/
│   └── ocr.ts              # TypeScript type definitions
├── supabase-schema.sql     # Database schema
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind configuration
└── package.json
```

## 🔑 API Routes

### GET /api/configs

Fetch OCR configurations with optional filters.

**Query Params:**
- `documentType` (optional)
- `companyId` (optional)
- `transporterCompanyId` (optional)

**Response:** Array of `OcrConfig`

### POST /api/configs

Create a new OCR configuration.

**Body:**
```json
{
  "document_type": "Freight Invoice",
  "company_id": "ABC_CORP",
  "apply_at_transporter_level": false,
  "transporter_company_id": null,
  "fields": [...],
  "prompt": "Extract the following information..."
}
```

**Response:** Created `OcrConfig`

### PUT /api/configs/[id]

Update an existing configuration.

**Body:** Partial `OcrConfig`

### DELETE /api/configs/[id]

Delete a configuration (cascades to associated OCR runs).

### POST /api/ocr/run

Execute OCR on a document.

**Body:**
```json
{
  "configId": "uuid", // or use documentType + companyId + transporterCompanyId
  "inputText": "Document content here...",
  "fileUrl": "optional-url"
}
```

**Response:**
```json
{
  "runId": "uuid",
  "status": "success",
  "mapped_payload": {...},
  "raw_response": {...}
}
```

## 🗄 Database Schema

See `supabase-schema.sql` for the complete schema. Key tables:

- **ocr_configs**: OCR configuration storage
  - Unique constraint on `(document_type, company_id, transporter_company_id)`
- **ocr_runs**: OCR execution history with results

## 🎨 Domain Model

### OCR Configuration Scope

Configurations are uniquely identified by:
1. **Document Type** (e.g., "Freight Invoice", "POD", "LR")
2. **Company ID** (required)
3. **Transporter Company ID** (optional, based on `apply_at_transporter_level`)

### Field Configuration

Each field defines:
- Display label and internal key
- Data type (string, number, date, boolean, array)
- Required flag
- Optional example value
- Optional mapping to freight payload schema

### Freight Payload Keys

Standard schema keys available for mapping:
- `invoice_number`, `invoice_date`, `due_date`
- `consignor_name`, `consignee_name`, `transporter_name`
- `total_amount`, `tax_amount`
- `lr_number`, `vehicle_number`
- `origin_location`, `destination_location`
- `line_items[]`

## 🔒 Security Notes

- **Service Role Key**: Never expose to client-side code (only used in API routes)
- **CORS**: API routes are server-side only
- **Rate Limiting**: Consider adding rate limiting for production
- **Authentication**: Add auth layer for multi-user scenarios

## 🐛 Troubleshooting

### Build Errors

```bash
# Clean install
rm -rf node_modules package-lock.json .next
npm install
npm run build
```

### Supabase Connection Issues

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are correct
- Check if Supabase project is active
- Run the schema SQL if tables don't exist

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API quotas and usage limits
- Ensure you're using a supported model (gpt-4o recommended)

## 📝 License

MIT

## 🤝 Contributing

This is a private project. For questions or issues, contact the repository owner.

---

**Built with ❤️ using Next.js, Supabase, and OpenAI**

