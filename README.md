# PDF Template Engine

A configurable PDF template engine for dynamic document generation (invoices, ePODs, gate passes, etc.).

## Features

- **Multi-document support**: Invoice, ePOD, Gate Pass, Delivery Challan, etc.
- **Hierarchical templates**: Global → Consignor → Consignor+Transporter
- **Versioning**: Track template changes with audit logs
- **Field configuration**: Aliasing, visibility, ordering
- **Admin UI**: Business-friendly template configuration
- **REST APIs**: Fetch templates and generate PDFs

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services (API + Database)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

The API will be available at `http://localhost:3000`

### Option 2: Local Development

#### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

#### Installation

```bash
# Install backend dependencies
npm install

# Install admin UI dependencies
cd admin-ui && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Create database
createdb pdf_template_engine

# Run migrations
npm run migrate

# Start development server
npm run dev

# Start admin UI (in separate terminal)
npm run admin
```

### Access Points

- **API**: http://localhost:3000
- **Admin UI**: http://localhost:3001
- **Health Check**: http://localhost:3000/health
- **API Docs**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

### Testing the API

```bash
# Make test script executable
chmod +x scripts/test-api.sh

# Run API tests
./scripts/test-api.sh
```

## API Endpoints

### 1. Fetch Template Configuration

```bash
GET /api/pdf-template?document_type=invoice&consignor_id=HRI&transporter_id=UNION
```

### 2. Generate PDF

```bash
POST /api/pdf-template/generate
Content-Type: application/json

{
  "document_type": "invoice",
  "consignor_id": "HRI",
  "transporter_id": "UNION",
  "payload": {
    "trip_id": "36369289",
    "invoice_number": "INV-17575",
    "freight_charge": 7534,
    ...
  }
}
```

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## Architecture

```
┌─────────────────────────────────────────┐
│         Calling Products                │
│  (Invoice, ePOD, Gate Pass, etc.)      │
└──────────────────┬──────────────────────┘
                   │
                   v
┌─────────────────────────────────────────┐
│       PDF Template Engine API            │
│  ┌────────────┐      ┌──────────────┐  │
│  │  Template  │──────│  PDF Service │  │
│  │  Service   │      │  (PDFKit)    │  │
│  └────────────┘      └──────────────┘  │
└──────────────────┬──────────────────────┘
                   │
                   v
┌─────────────────────────────────────────┐
│          PostgreSQL Database             │
│  • pdf_templates                         │
│  • template_versions                     │
│  • audit_logs                            │
│  • document_fields                       │
└─────────────────────────────────────────┘
```

## Database Schema

### Core Tables

#### `pdf_templates`
Stores template configurations with hierarchical scoping.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| template_name | VARCHAR | Template name |
| document_type | VARCHAR | invoice, epod, gate_pass, etc. |
| consignor_id | VARCHAR | NULL for global templates |
| transporter_id | VARCHAR | NULL for consignor-only templates |
| version | INTEGER | Version number |
| is_active | BOOLEAN | Active status |
| config_json | JSONB | Template configuration |
| created_by | VARCHAR | Creator identifier |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `template_versions`
Version history for audit and rollback.

#### `audit_logs`
Tracks all template operations (CREATE, UPDATE, DELETE, GENERATE).

#### `document_fields`
Registry of available fields per document type.

## Configuration Structure

Templates use a JSON configuration structure:

```json
{
  "layout": {
    "pageSize": "A4",
    "margins": { "top": 50, "right": 50, "bottom": 50, "left": 50 }
  },
  "header": {
    "showLogo": true,
    "title": "FREIGHT INVOICE",
    "fields": [
      { "key": "invoice_number", "label": "Invoice #", "visible": true }
    ]
  },
  "sections": [
    {
      "name": "from",
      "title": "From (Consignor)",
      "fields": [
        { "key": "consignor_name", "label": "Name", "visible": true }
      ]
    }
  ],
  "charges": {
    "items": [
      { "key": "freight_charge", "label": "Freight", "visible": true }
    ]
  },
  "footer": {
    "showBankDetails": true,
    "text": "Terms and conditions..."
  }
}
```

## Template Priority Logic

When fetching a template, the system follows this hierarchy:

1. **Consignor + Transporter** (Most specific)
2. **Consignor only**
3. **Global** (Default fallback)

Example:
- Request: `consignor_id=HRI, transporter_id=UNION`
- Searches: HRI+UNION → HRI → Global
- Returns: First match found

## Field Aliasing

Business teams can rename fields without code changes:

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

## Project Structure

```
pdf-template-engine/
├── src/
│   ├── controllers/        # API controllers
│   ├── services/          # Business logic
│   │   ├── templateService.ts
│   │   └── pdfService.ts
│   ├── routes/            # API routes
│   ├── db/                # Database connection & migrations
│   │   ├── connection.ts
│   │   ├── schema.sql
│   │   └── migrate.ts
│   ├── types/             # TypeScript types
│   └── server.ts          # Express server
├── admin-ui/              # Next.js admin interface
│   ├── app/
│   │   ├── page.tsx       # Main admin page
│   │   ├── layout.tsx
│   │   └── globals.css
│   └── package.json
├── scripts/               # Utility scripts
│   └── test-api.sh        # API testing script
├── uploads/               # Logo uploads
├── outputs/               # Generated PDFs
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Tech Stack

- **Backend**: Node.js + TypeScript + Express
- **Database**: PostgreSQL 14+
- **PDF Generation**: PDFKit
- **Admin UI**: React + Next.js 14
- **Container**: Docker + Docker Compose

## Development

### Adding New Document Types

1. Add field definitions to `document_fields` table:
```sql
INSERT INTO document_fields (document_type, field_key, field_label, field_type) 
VALUES ('epod', 'delivery_date', 'Delivery Date', 'date');
```

2. Create default template in admin UI or via API

3. Implement custom rendering in `pdfService.ts` if needed

### Extending PDF Rendering

Edit `src/services/pdfService.ts`:

```typescript
switch (template.document_type) {
  case 'invoice':
    this.renderInvoice(doc, config, payload);
    break;
  case 'epod':
    this.renderEPOD(doc, config, payload);  // Add new renderer
    break;
  // ...
}
```

## Production Deployment

### Environment Variables

```bash
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=pdf_template_engine
DB_USER=your-user
DB_PASSWORD=your-password
BASE_URL=https://your-domain.com
```

### Using Docker

```bash
# Build and deploy
docker-compose up -d --build

# Scale API instances
docker-compose up -d --scale api=3
```

### Database Backup

```bash
# Backup
pg_dump pdf_template_engine > backup.sql

# Restore
psql pdf_template_engine < backup.sql
```

## Future Enhancements

- [ ] Drag-and-drop WYSIWYG template designer
- [ ] Logo upload support via admin UI
- [ ] QR code generation
- [ ] Multi-language support
- [ ] Digital signatures (DocuSign integration)
- [ ] Conditional field logic (if/else)
- [ ] Email delivery integration
- [ ] S3/Cloud storage for PDFs
- [ ] Template preview before generation
- [ ] Bulk PDF generation

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -U postgres -d pdf_template_engine
```

### PDF Generation Errors
- Check `outputs` directory permissions
- Verify template configuration JSON is valid
- Check payload contains all required fields

### Admin UI Not Loading
```bash
# Rebuild admin UI
cd admin-ui
npm install
npm run dev
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

MIT

