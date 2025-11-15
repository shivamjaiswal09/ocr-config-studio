# Setup Guide - PDF Template Engine

Complete setup guide for getting the PDF Template Engine running.

## Prerequisites

Ensure you have the following installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** (comes with Node.js)
- **Docker** (optional, for containerized deployment)

## Setup Methods

### Method 1: Docker Setup (Easiest)

This method requires only Docker and Docker Compose.

#### Step 1: Clone/Download the Project

```bash
cd /path/to/pdf-template-engine
```

#### Step 2: Start Services

```bash
# Start all services (PostgreSQL + API)
docker-compose up -d

# Wait for services to be ready (check logs)
docker-compose logs -f api
```

#### Step 3: Verify Installation

```bash
# Check API health
curl http://localhost:3000/health

# Check if default template exists
curl "http://localhost:3000/api/pdf-template?document_type=invoice"
```

#### Step 4: Access Admin UI

The admin UI runs separately:

```bash
cd admin-ui
npm install
npm run dev
```

Access at: http://localhost:3001

---

### Method 2: Local Development Setup

#### Step 1: Install Dependencies

```bash
# Install backend dependencies
npm install

# Install admin UI dependencies
cd admin-ui
npm install
cd ..
```

#### Step 2: Set Up PostgreSQL

##### Option A: Using existing PostgreSQL installation

```bash
# Create database
createdb pdf_template_engine

# Or using psql
psql -U postgres
CREATE DATABASE pdf_template_engine;
\q
```

##### Option B: Using Docker for PostgreSQL only

```bash
docker run -d \
  --name pdf-postgres \
  -e POSTGRES_DB=pdf_template_engine \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:14-alpine
```

#### Step 3: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env file with your settings
nano .env  # or use your preferred editor
```

Update the following values in `.env`:

```bash
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pdf_template_engine
DB_USER=postgres
DB_PASSWORD=your-password-here

# Directories
UPLOAD_DIR=./uploads
PDF_OUTPUT_DIR=./outputs
BASE_URL=http://localhost:3000
```

#### Step 4: Run Database Migration

```bash
npm run migrate
```

You should see:
```
✅ Migration completed successfully
```

#### Step 5: Start Backend Server

```bash
# Development mode (with hot reload)
npm run dev

# Production mode
npm run build
npm start
```

The API will be available at: http://localhost:3000

#### Step 6: Start Admin UI

In a separate terminal:

```bash
cd admin-ui
npm run dev
```

The admin UI will be available at: http://localhost:3001

---

## Verification Steps

### 1. Test API Health

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Check Default Template

```bash
curl "http://localhost:3000/api/pdf-template?document_type=invoice"
```

Should return the default invoice template configuration.

### 3. Generate Test PDF

```bash
curl -X POST http://localhost:3000/api/pdf-template/generate \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "invoice",
    "payload": {
      "invoice_number": "TEST-001",
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
```

Response will include a `pdf_url`. Open it in your browser to view the generated PDF.

### 4. Test Admin UI

1. Open http://localhost:3001
2. Click "Create New" tab
3. Fill in template details
4. Configure fields
5. Click "Create Template"
6. Check "Templates" tab to see your new template

---

## Troubleshooting

### Issue: Database connection refused

**Solution:**
```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it
# macOS:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Or use Docker:
docker-compose up postgres -d
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>

# Or change port in .env file
PORT=3001
```

### Issue: Migration fails

**Solution:**
```bash
# Check database exists
psql -U postgres -l | grep pdf_template_engine

# Drop and recreate if needed
dropdb pdf_template_engine
createdb pdf_template_engine
npm run migrate
```

### Issue: PDFs not generating

**Solution:**
```bash
# Check outputs directory exists and is writable
ls -la outputs/
chmod 755 outputs/

# Check logs for errors
# Look in console output for error details
```

### Issue: Admin UI not connecting to API

**Solution:**

1. Check API is running: `curl http://localhost:3000/health`
2. Update API base URL in `admin-ui/app/page.tsx` if needed:
   ```typescript
   const API_BASE = 'http://localhost:3000/api'
   ```
3. Check CORS settings in `src/server.ts`

---

## Running Tests

### API Tests

```bash
# Make script executable
chmod +x scripts/test-api.sh

# Run tests
./scripts/test-api.sh
```

This will:
1. Check health endpoint
2. Fetch default template
3. Generate a sample invoice PDF

### Manual Testing

Use tools like:
- **Postman**: Import endpoints from API_DOCUMENTATION.md
- **curl**: See examples in API_DOCUMENTATION.md
- **Browser**: Visit http://localhost:3000/health

---

## Production Deployment

### Using Docker

```bash
# Build and start
docker-compose -f docker-compose.yml up -d --build

# Check logs
docker-compose logs -f

# Stop
docker-compose down
```

### Without Docker

```bash
# Install dependencies
npm install --production

# Build TypeScript
npm run build

# Set environment
export NODE_ENV=production
export DB_HOST=your-production-db
# ... set other env vars

# Run migrations
npm run migrate

# Start server
npm start
```

### Environment Variables for Production

```bash
NODE_ENV=production
PORT=3000
DB_HOST=production-db-host
DB_PORT=5432
DB_NAME=pdf_template_engine
DB_USER=prod_user
DB_PASSWORD=strong-password-here
BASE_URL=https://your-domain.com
```

---

## Next Steps

1. **Create Templates**: Use the admin UI to create templates for your use cases
2. **Integrate with Apps**: Use API endpoints in your calling applications
3. **Configure Fields**: Customize field aliases and visibility per customer
4. **Test Generation**: Generate test PDFs with real data
5. **Monitor Logs**: Check audit_logs table for all operations

---

## Support

For issues or questions:
1. Check the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review this setup guide
3. Check application logs
4. Review database logs: `docker-compose logs postgres`

---

## Development Tips

### Hot Reload

The development server (`npm run dev`) uses `tsx watch` for hot reloading. Changes to TypeScript files will automatically restart the server.

### Database Schema Changes

After modifying `src/db/schema.sql`:

```bash
# Rebuild from scratch (CAUTION: Deletes all data)
dropdb pdf_template_engine
createdb pdf_template_engine
npm run migrate
```

### Debugging

Add debug logging:

```typescript
console.log('Debug:', variable);
```

Or use a debugger:
```bash
node --inspect dist/server.js
```

---

## File Permissions

Ensure these directories are writable:

```bash
chmod 755 uploads/
chmod 755 outputs/
```

---

## Complete Setup Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL 14+ installed (or Docker)
- [ ] Dependencies installed (`npm install`)
- [ ] Environment file configured (`.env`)
- [ ] Database created
- [ ] Migrations run successfully
- [ ] Backend server running
- [ ] Admin UI running
- [ ] Health check passing
- [ ] Default template exists
- [ ] Test PDF generated successfully

Once all items are checked, you're ready to use the PDF Template Engine! 🎉

