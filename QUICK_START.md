# Quick Start - PDF Template Engine

Get up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed (or use Docker)

## Option 1: Docker (Easiest) ⚡

```bash
# 1. Start services
docker-compose up -d

# 2. Wait 10 seconds for database setup

# 3. Test the API
curl http://localhost:3000/health

# 4. Generate a test PDF
curl -X POST http://localhost:3000/api/pdf-template/generate \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "invoice",
    "payload": {
      "invoice_number": "INV-001",
      "invoice_date": "2024-01-15",
      "trip_id": "12345",
      "consignor_name": "Test Company",
      "consignee_name": "Customer Inc",
      "freight_charge": 1000,
      "cgst": 90,
      "sgst": 90,
      "total_amount": 1180
    }
  }'

# 5. Open the PDF URL from the response in your browser
```

**Access Points:**
- API: http://localhost:3000
- Health: http://localhost:3000/health

**Stop services:**
```bash
docker-compose down
```

---

## Option 2: Local Setup 🔧

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials

# 3. Create database
createdb pdf_template_engine

# 4. Run migration
npm run migrate

# 5. Start server
npm run dev
```

**Server runs on:** http://localhost:3000

---

## Admin UI Setup 🎨

```bash
# In a separate terminal
cd admin-ui
npm install
npm run dev
```

**Admin UI runs on:** http://localhost:3001

---

## Test the System

### 1. Check Health
```bash
curl http://localhost:3000/health
```

### 2. Fetch Default Template
```bash
curl "http://localhost:3000/api/pdf-template?document_type=invoice"
```

### 3. Generate Sample Invoice
```bash
curl -X POST http://localhost:3000/api/pdf-template/generate \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "invoice",
    "payload": {
      "invoice_number": "INV-17575",
      "invoice_date": "2024-01-15",
      "trip_id": "36369289",
      "vehicle_number": "MH12AB1234",
      "consignor_name": "ABC Manufacturing Pvt Ltd",
      "consignor_address": "123 Industrial Area, Mumbai",
      "consignor_gst": "27AABCU9603R1ZM",
      "consignee_name": "XYZ Retail Store",
      "consignee_address": "456 Market Road, Delhi",
      "from_location": "Mumbai",
      "to_location": "Delhi",
      "freight_charge": 7534.00,
      "loading_charge": 500.00,
      "cgst": 676.53,
      "sgst": 676.53,
      "total_amount": 9887.06
    }
  }'
```

Response includes a `pdf_url` - open it in your browser to view the PDF!

---

## Using the Admin UI

1. **Open** http://localhost:3001
2. **Click** "Create New" tab
3. **Fill in:**
   - Template Name: "My Custom Invoice"
   - Document Type: invoice
   - Consignor ID: TEST
   - Transporter ID: DEMO
4. **Configure** header fields and charges
5. **Click** "Create Template"
6. **Check** "Templates" tab to see your new template

---

## API Integration Example

### Node.js
```javascript
const axios = require('axios');

async function generateInvoice() {
  const response = await axios.post('http://localhost:3000/api/pdf-template/generate', {
    document_type: 'invoice',
    consignor_id: 'HRI',
    transporter_id: 'UNION',
    payload: {
      invoice_number: 'INV-123',
      // ... other fields
    }
  });
  
  console.log('PDF URL:', response.data.pdf_url);
  return response.data.pdf_url;
}
```

### Python
```python
import requests

def generate_invoice():
    response = requests.post('http://localhost:3000/api/pdf-template/generate', json={
        'document_type': 'invoice',
        'consignor_id': 'HRI',
        'transporter_id': 'UNION',
        'payload': {
            'invoice_number': 'INV-123',
            # ... other fields
        }
    })
    
    print('PDF URL:', response.json()['pdf_url'])
    return response.json()['pdf_url']
```

### cURL
```bash
curl -X POST http://localhost:3000/api/pdf-template/generate \
  -H "Content-Type: application/json" \
  -d '{"document_type":"invoice","payload":{...}}'
```

---

## Common Issues

### Port 3000 already in use
```bash
# Change port in .env
PORT=3001
```

### Database connection error
```bash
# Check PostgreSQL is running
pg_isready

# Or use Docker for PostgreSQL
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=postgres postgres:14
```

### PDF not generating
```bash
# Check outputs directory exists
mkdir -p outputs
chmod 755 outputs
```

---

## Next Steps

- 📖 Read [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference
- 🛠️ Read [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed setup instructions
- 📝 Read [README.md](./README.md) for architecture and design details
- 🎯 Read [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) for technical overview

---

## Directory Structure

```
PDF template/
├── src/                   # Backend source code
├── admin-ui/              # Admin interface
├── outputs/               # Generated PDFs appear here
├── uploads/               # Logo uploads
├── scripts/               # Utility scripts
└── docker-compose.yml     # Docker setup
```

---

## Stopping the Server

### Docker
```bash
docker-compose down
```

### Local
```bash
# Press Ctrl+C in the terminal running the server
```

---

## Getting Help

1. Check console logs for errors
2. Verify database connection: `psql -U postgres -d pdf_template_engine`
3. Check API health: `curl http://localhost:3000/health`
4. Review [SETUP_GUIDE.md](./SETUP_GUIDE.md) for troubleshooting

---

## Production Deployment

See [README.md](./README.md) for production deployment instructions.

---

**You're all set! 🎉**

Start integrating the PDF engine into your applications using the API endpoints.

