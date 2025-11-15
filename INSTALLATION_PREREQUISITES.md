# Installation Prerequisites

Your system needs Node.js and PostgreSQL to run the PDF Template Engine locally.

## Current Status

❌ Node.js - Not installed  
❌ PostgreSQL - Not installed  
❌ Docker - Not installed

## Installation Steps for macOS

### Option 1: Using Homebrew (Recommended)

#### Step 1: Install Homebrew (if not installed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

#### Step 2: Install Node.js

```bash
brew install node@18
```

Verify installation:
```bash
node --version  # Should show v18.x.x
npm --version   # Should show 9.x.x or higher
```

#### Step 3: Install PostgreSQL

```bash
brew install postgresql@14
brew services start postgresql@14
```

Verify installation:
```bash
psql --version  # Should show PostgreSQL 14.x
```

Create the database:
```bash
createdb pdf_template_engine
```

---

### Option 2: Using Official Installers

#### Node.js
1. Download from: https://nodejs.org/
2. Choose "18.x LTS" version
3. Run the installer
4. Verify: `node --version`

#### PostgreSQL
1. Download from: https://www.postgresql.org/download/macosx/
2. Choose "Postgres.app" or "Installer" for version 14
3. Run the installer
4. Start PostgreSQL service
5. Create database:
   ```bash
   /Applications/Postgres.app/Contents/Versions/14/bin/createdb pdf_template_engine
   ```

---

### Option 3: Using Docker (Easiest, All-in-One)

#### Install Docker Desktop
1. Download from: https://www.docker.com/products/docker-desktop
2. Install Docker Desktop for Mac
3. Start Docker Desktop
4. Verify: `docker --version`

#### Run the Application
```bash
cd "/Users/admin/Desktop/PDF template"
docker-compose up -d
```

This will automatically:
- Install PostgreSQL
- Set up the database
- Install all dependencies
- Start the API server

Access at: http://localhost:3000

---

## After Installation: Running Locally

Once you have Node.js and PostgreSQL installed:

```bash
# Navigate to project
cd "/Users/admin/Desktop/PDF template"

# Install dependencies
npm install

# Run database migration
npm run migrate

# Start development server
npm run dev
```

The server will be available at: **http://localhost:3000**

---

## Quick Test

After installation:

```bash
# Test health endpoint
curl http://localhost:3000/health

# Generate a test PDF
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

---

## Starting the Admin UI

After the backend is running:

```bash
# In a new terminal
cd "/Users/admin/Desktop/PDF template/admin-ui"
npm install
npm run dev
```

Admin UI will be available at: **http://localhost:3001**

---

## Recommended: Docker Approach

For the easiest setup, I recommend **Option 3 (Docker)**:

1. Install Docker Desktop for Mac: https://www.docker.com/products/docker-desktop
2. Open Docker Desktop and wait for it to start
3. Run: `docker-compose up -d`
4. Done! API runs at http://localhost:3000

No need to install Node.js or PostgreSQL separately.

---

## Need Help?

- **Node.js issues**: https://nodejs.org/en/docs/
- **PostgreSQL issues**: https://www.postgresql.org/docs/
- **Docker issues**: https://docs.docker.com/desktop/mac/
- Check the SETUP_GUIDE.md for detailed troubleshooting

---

## Next Steps

1. Choose an installation option above
2. Follow the installation steps
3. Run the application
4. Test the API endpoints
5. Open the Admin UI

Once prerequisites are installed, the application will start successfully! 🚀

