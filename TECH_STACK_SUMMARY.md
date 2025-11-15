# 🛠️ PDF Template Engine - Complete Tech Stack Summary

## 📋 Project Overview
**Configurable PDF Template Engine** for dynamic generation of logistics documents (invoices, ePODs, gate passes) with:
- Template configuration per (document_type + consignor_id + transporter_id)
- Drag-and-drop visual builder with live preview
- Section-based layout system with field-level customization
- REST API for template management and PDF generation

---

## 🏗️ Architecture

### **Pattern:** Microservices-style with separate Frontend & Backend
```
┌─────────────────┐
│   Admin UI      │ ← Next.js/React (Port 3001)
│  (Frontend)     │
└────────┬────────┘
         │ HTTP/REST
         ↓
┌─────────────────┐
│   Backend API   │ ← Node.js/Express (Port 3000)
│   (Server)      │
└────────┬────────┘
         │ SQL
         ↓
┌─────────────────┐
│   PostgreSQL    │ ← Database (Port 5432)
│   (Database)    │
└─────────────────┘
```

---

## 💻 Backend Stack

### **Runtime & Framework**
- **Node.js** (v18+) - JavaScript runtime
- **TypeScript** (v5.x) - Type-safe JavaScript
- **Express.js** (v4.x) - Web framework for REST APIs

### **Database**
- **PostgreSQL** (v14+) - Relational database
- **pg** (node-postgres) - PostgreSQL client for Node.js
- **JSONB** data type - Flexible schema storage for template configs

### **PDF Generation**
- **PDFKit** (v0.15+) - Dynamic PDF generation library
  - Supports custom layouts, fonts, tables, images
  - Stream-based PDF creation
  - Programmatic positioning and styling

### **Core Libraries**
```json
{
  "express": "^4.18.2",
  "cors": "^2.8.5",
  "dotenv": "^16.0.3",
  "pg": "^8.11.3",
  "pdfkit": "^0.15.0",
  "typescript": "^5.0.0",
  "tsx": "^4.7.0"
}
```

### **Project Structure**
```
backend/
├── src/
│   ├── server.ts              # Express app setup
│   ├── config/
│   │   └── database.ts        # PostgreSQL connection pool
│   ├── routes/
│   │   ├── pdfTemplateRoutes.ts    # Template CRUD APIs
│   │   └── documentFieldRoutes.ts  # Field metadata APIs
│   ├── controllers/
│   │   └── pdfGeneratorController.ts  # PDF generation logic
│   └── types/
│       └── index.ts           # TypeScript interfaces
├── migrations/
│   └── 001_initial_schema.sql  # Database schema
└── package.json
```

### **Database Schema**

#### **Table: pdf_templates**
```sql
CREATE TABLE pdf_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  consignor_id VARCHAR(100),
  transporter_id VARCHAR(100),
  version INTEGER DEFAULT 1,
  config_json JSONB NOT NULL,
  created_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

#### **Table: document_fields**
```sql
CREATE TABLE document_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type VARCHAR(50) NOT NULL,
  field_key VARCHAR(100) NOT NULL,
  field_label VARCHAR(255) NOT NULL,
  field_type VARCHAR(50) NOT NULL,
  is_required BOOLEAN DEFAULT FALSE,
  validation_rules JSONB,
  display_order INTEGER,
  UNIQUE(document_type, field_key)
);
```

#### **Table: pdf_generation_logs**
```sql
CREATE TABLE pdf_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES pdf_templates(id),
  document_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  pdf_url TEXT,
  status VARCHAR(50) NOT NULL,
  error_message TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  generated_by VARCHAR(100)
);
```

---

## 🎨 Frontend Stack

### **Framework & Runtime**
- **Next.js** (v14.x) - React framework with App Router
- **React** (v18.x) - UI library
- **TypeScript** - Type-safe React components

### **Key Features**
- **App Router** (Next.js 13+ convention) - File-based routing
- **Client Components** (`'use client'`) - Interactive UI
- **CSS Modules** - Component-scoped styling

### **HTTP Client**
- **Axios** (v1.x) - Promise-based HTTP requests to backend API

### **Core Libraries**
```json
{
  "next": "14.2.15",
  "react": "^18",
  "react-dom": "^18",
  "axios": "^1.7.9",
  "typescript": "^5"
}
```

### **Project Structure**
```
admin-ui/
├── app/
│   ├── page.tsx                    # Main admin UI (simple form)
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Global styles
│   ├── sections-builder/
│   │   ├── page.tsx                # Drag-drop builder (advanced)
│   │   └── sections.css            # Builder styles
│   └── api/                        # (not used - backend separate)
├── public/                         # Static assets
├── package.json
└── next.config.mjs
```

---

## 🎯 REST API Endpoints

### **Template Management**

#### **1. Create Template**
```http
POST /api/pdf-template
Content-Type: application/json

{
  "template_name": "HRI Invoice Template",
  "document_type": "invoice",
  "consignor_id": "HRI",
  "transporter_id": "UNION",
  "created_by": "admin",
  "config_json": {
    "orientation": "Portrait",
    "pageSize": "A4",
    "sections": [...]
  }
}
```

#### **2. List All Templates**
```http
GET /api/pdf-template/list
```

#### **3. Get Specific Template**
```http
GET /api/pdf-template?document_type=invoice&consignor_id=HRI&transporter_id=UNION
```

#### **4. Update Template**
```http
PUT /api/pdf-template/:id
```

#### **5. Delete Template**
```http
DELETE /api/pdf-template/:id
```

#### **6. Generate PDF**
```http
POST /api/pdf-template/generate
Content-Type: application/json

{
  "document_type": "invoice",
  "consignor_id": "HRI",
  "transporter_id": "UNION",
  "payload": {
    "invoice_number": "INV-12345",
    "invoice_date": "2024-11-14",
    "freight_charge": 7534,
    ...
  }
}
```

### **Document Fields**

#### **7. Get Fields for Document Type**
```http
GET /api/document-fields/:document_type
```

---

## 🎨 UI Architecture

### **Two UI Modes**

#### **1. Simple Form Builder** (`/`)
- Traditional form-based configuration
- Field selection with visibility toggles
- Aliasing and ordering (▲▼ buttons)
- Live preview panel (right side)
- Used for: Quick template setup

#### **2. Advanced Section Builder** (`/sections-builder`)
- **WYSIWYG drag-and-drop editor**
- Canvas-based layout (A4/Letter, Portrait/Landscape)
- Predefined draggable sections
- Click to select, drag to move
- Resize handles (8 directions: N, S, E, W, NE, NW, SE, SW)
- Properties panel for field/section customization
- Live validation (overflow warnings, table width checks)
- Canvas panning (mouse drag + spacebar)
- Grid snapping (optional)
- Used for: Advanced visual layout design

---

## 🧩 Key Features Implemented

### **Template Configuration**
- ✅ Document type tagging (invoice, epod, gate_pass)
- ✅ Hierarchical scoping (Global → Consignor → Consignor+Transporter)
- ✅ Field aliasing (rename display labels)
- ✅ Visibility toggles (show/hide fields)
- ✅ Section-based layout (8 predefined sections)
- ✅ Field-level styling (font size, weight, color)
- ✅ Section name customization (show/hide, color, font size)
- ✅ Table column configuration (reordering, width control)
- ✅ Payload mapping (field key → JSON payload key)

### **Visual Builder Features**
- ✅ Drag-and-drop sections (mouse-based positioning)
- ✅ Canvas panning (drag background, spacebar + drag)
- ✅ Section resizing (8 corner/edge handles)
- ✅ Grid snapping (configurable on/off)
- ✅ Zoom control (50% - 200%)
- ✅ Orientation toggle (Portrait/Landscape with visual feedback)
- ✅ Page size selector (A4, Letter, Legal)
- ✅ Panel hide/show (Sections, Properties)
- ✅ Live validation (red borders, error messages)
- ✅ Center canvas button (reset viewport)

### **Section Types**
1. **Company Details** - Logo, name, address, GST
2. **Invoice Details** - Invoice #, date, due date
3. **Bill From** - Consignor details
4. **Bill To** - Consignee details
5. **Line Item Table** - Product rows, quantities, amounts
6. **GST Summary** - CGST, SGST, IGST breakdown
7. **Total Summary** - Grand total, amount in words
8. **Notes/Declaration** - Footer text, disclaimers

### **Field Customization Per Section**
- ✅ Add/Remove fields dynamically
- ✅ Payload key mapping (e.g., `freight_charge`)
- ✅ Display label aliasing (e.g., "Transport Charges")
- ✅ Visibility toggle per field
- ✅ Font size (10-24px, with "Auto" suggestion)
- ✅ Font weight (normal, medium, semibold, bold)
- ✅ Text color (hex color picker)

### **Table-Specific Features**
- ✅ Column add/remove
- ✅ Column width configuration (validation if total > page width)
- ✅ Header/alignment control
- ✅ Auto-calculate remaining width

---

## 🎯 Template Storage Format (JSON)

### **Section Builder Template Structure**
```json
{
  "orientation": "Portrait",
  "pageSize": "A4",
  "sections": [
    {
      "id": "company-details",
      "name": "Company Details",
      "type": "group",
      "position": { "x": 50, "y": 50 },
      "size": { "width": 400, "height": 120 },
      "visible": true,
      "showSectionName": true,
      "sectionNameColor": "#666666",
      "sectionNameFontSize": 14,
      "fields": [
        {
          "key": "company_name",
          "label": "Company Name",
          "payloadKey": "company_name",
          "visible": true,
          "fontSize": 16,
          "fontWeight": "bold",
          "color": "#333333"
        }
      ]
    },
    {
      "id": "line-items",
      "name": "Line Item Table",
      "type": "table",
      "position": { "x": 50, "y": 400 },
      "size": { "width": 700, "height": 200 },
      "visible": true,
      "columns": [
        {
          "key": "product_name",
          "header": "Product",
          "payloadKey": "items[].product_name",
          "width": 200,
          "visible": true
        }
      ]
    }
  ]
}
```

---

## 🔧 Development Tools

### **Build & Run**
- **tsx** - TypeScript execution (dev mode, migrations)
- **npm scripts** - Task automation

### **Backend Scripts**
```json
{
  "dev": "tsx src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "migrate": "tsx migrations/001_initial_schema.sql"
}
```

### **Frontend Scripts**
```json
{
  "dev": "next dev -p 3001",
  "build": "next build",
  "start": "next start -p 3001"
}
```

### **Environment Management**
- **.env file** - Configuration (PostgreSQL connection, ports)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pdf_templates_db
DB_USER=postgres
DB_PASSWORD=yourpassword
PORT=3000
ADMIN_UI_PORT=3001
```

---

## 🗄️ Data Flow

### **Template Creation Flow**
```
User (Admin UI) 
  → Drag sections on canvas
  → Configure fields/colors/fonts
  → Click "Save Template"
  → POST /api/pdf-template
  → Express API validates
  → PostgreSQL stores config_json (JSONB)
  → Returns success/error
  → UI shows confirmation
```

### **PDF Generation Flow**
```
Client Application
  → Calls POST /api/pdf-template/generate
  → Payload: { document_type, consignor_id, transporter_id, data }
  → Backend fetches matching template from DB
  → Applies hierarchical scoping (specific → general)
  → Merges payload data with template config
  → PDFKit generates PDF with configured layout
  → Saves PDF to filesystem (/generated-pdfs/)
  → Logs to pdf_generation_logs table
  → Returns { pdf_url: "..." }
  → Client downloads/displays PDF
```

---

## 🎨 Styling Approach

### **Global Styles** (`admin-ui/app/globals.css`)
- Reset/normalize CSS
- Typography (system fonts)
- Color palette (CSS variables)
- Common components (buttons, cards, forms)
- Responsive grid layouts

### **Component Styles** (`sections-builder/sections.css`)
- BEM-like naming (`.builder-toolbar`, `.canvas-section`)
- Absolute positioning for canvas sections
- Flexbox for toolbars and panels
- CSS transforms for drag/resize
- Transitions for smooth interactions

### **Key CSS Features**
- ✅ **Flexbox layouts** - Toolbar, panels
- ✅ **Grid system** - 3-column layout (Palette | Canvas | Properties)
- ✅ **Absolute positioning** - Canvas sections (for precise placement)
- ✅ **CSS transforms** - Drag operations, hover effects
- ✅ **Transitions** - Smooth animations (0.2s ease)
- ✅ **Scrollable containers** - Independent panel scrolling
- ✅ **Custom scrollbars** - Styled for visibility
- ✅ **Cursor management** - `grab`, `grabbing`, `move`, `nwse-resize`

---

## 🧪 State Management

### **React State (useState)**
- Component-local state only (no Redux/Context)
- Key state variables in Section Builder:
  - `template` - Full template object (sections, config)
  - `selectedSection` - Currently selected section ID
  - `draggingSection` - Section being dragged (ID + offset)
  - `resizingSection` - Section being resized (ID + handle)
  - `isDraggingCanvas` - Canvas panning state
  - `canvasPosition` - Canvas translation { x, y }
  - `errors` / `warnings` - Validation messages
  - `showLeftPanel` / `showRightPanel` - Panel visibility
  - `zoom` - Canvas zoom level (50-200%)

### **Event Handling**
- ✅ Mouse events: `onMouseDown`, `onMouseMove`, `onMouseUp`
- ✅ Keyboard events: `onKeyDown`, `onKeyUp` (spacebar panning)
- ✅ Form events: `onChange`, `onSubmit`
- ✅ Click events: Section selection, button actions

---

## 📦 Deployment Considerations

### **Current Setup** (Local Development)
- Backend: `http://localhost:3000`
- Frontend: `http://localhost:3001`
- Database: Local PostgreSQL (Postgres.app or Homebrew)

### **Production Recommendations**
1. **Backend Deployment**
   - Docker container (Node.js + Express)
   - Environment variables for DB connection
   - PM2 or systemd for process management

2. **Frontend Deployment**
   - Static export (`next build` + `next export`)
   - Deploy to Vercel, Netlify, or Nginx
   - Set `API_BASE` to production backend URL

3. **Database**
   - AWS RDS PostgreSQL
   - Connection pooling (pg-pool)
   - Automated backups

4. **File Storage**
   - S3 bucket for generated PDFs
   - Signed URLs for secure access
   - Cleanup old files (lifecycle policy)

---

## 🔐 Security Features

### **Current Implementation**
- ✅ CORS enabled (configurable origins)
- ✅ SQL injection prevention (parameterized queries)
- ✅ Input validation (required fields, type checks)
- ✅ Error handling (try-catch blocks)
- ✅ Audit logging (created_by, timestamps)

### **Recommended Additions**
- 🔜 JWT authentication
- 🔜 Role-based access control (RBAC)
- 🔜 Rate limiting (express-rate-limit)
- 🔜 HTTPS only in production
- 🔜 Input sanitization (DOMPurify)
- 🔜 PDF content validation (malicious payloads)

---

## 📊 Performance Optimizations

### **Backend**
- ✅ Connection pooling (pg.Pool)
- ✅ JSONB indexing for fast template queries
- ✅ Stream-based PDF generation (PDFKit)

### **Frontend**
- ✅ React component memoization (implicit)
- ✅ Lazy loading (Next.js code splitting)
- ✅ CSS containment (`contain: content`)

### **Recommended Improvements**
- 🔜 Redis caching for frequently used templates
- 🔜 CDN for static assets
- 🔜 Lazy load large sections
- 🔜 Debounce real-time preview updates
- 🔜 Virtual scrolling for long template lists

---

## 🧩 Third-Party Integrations

### **Current**
- None (self-contained system)

### **Potential Integrations**
- 🔜 AWS S3 (PDF storage)
- 🔜 SendGrid/Mailgun (email PDFs)
- 🔜 DocuSign (PDF signing)
- 🔜 OCR services (template extraction from samples)
- 🔜 Analytics (Mixpanel, Google Analytics)

---

## 🎓 Learning Resources Used

### **Libraries Documentation**
- [Next.js Docs](https://nextjs.org/docs)
- [Express.js Guide](https://expressjs.com/)
- [PDFKit Documentation](http://pdfkit.org/)
- [node-postgres](https://node-postgres.com/)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

### **TypeScript**
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- Interface definitions for type safety

---

## 📝 Key Files to Understand

### **Backend**
1. **`backend/src/server.ts`** - Express app initialization, middleware, CORS
2. **`backend/src/config/database.ts`** - PostgreSQL connection pool
3. **`backend/src/routes/pdfTemplateRoutes.ts`** - Template CRUD endpoints
4. **`backend/src/controllers/pdfGeneratorController.ts`** - PDF generation logic
5. **`backend/migrations/001_initial_schema.sql`** - Database schema

### **Frontend**
1. **`admin-ui/app/page.tsx`** - Simple form-based admin UI
2. **`admin-ui/app/sections-builder/page.tsx`** - Advanced drag-drop builder
3. **`admin-ui/app/globals.css`** - Global styling
4. **`admin-ui/app/sections-builder/sections.css`** - Builder-specific styles

---

## 🚀 Getting Started (Quick Summary)

### **Prerequisites**
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### **Setup Commands**
```bash
# 1. Install dependencies
cd backend && npm install
cd ../admin-ui && npm install

# 2. Configure environment
cp backend/.env.example backend/.env
# Edit .env with your PostgreSQL credentials

# 3. Setup database
psql -U postgres
CREATE DATABASE pdf_templates_db;
\q

# Run migrations
cd backend
npm run migrate

# 4. Start services
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
cd admin-ui && npm run dev
```

### **Access URLs**
- Admin UI: `http://localhost:3001/`
- Section Builder: `http://localhost:3001/sections-builder`
- Backend API: `http://localhost:3000/api`

---

## 🎯 Summary for ChatGPT

**This is a full-stack TypeScript application with:**
- **Backend:** Node.js + Express + PostgreSQL (JSONB for flexible schemas)
- **Frontend:** Next.js 14 + React + TypeScript (App Router, Client Components)
- **PDF Engine:** PDFKit for programmatic PDF generation
- **Architecture:** RESTful API with separate frontend/backend services
- **Key Feature:** Drag-and-drop visual builder for PDF template layouts
- **Data Model:** Templates stored as JSONB with section-based structure
- **UI Pattern:** Canvas-based editor with mouse interactions (drag, resize, pan)
- **Styling:** CSS (Flexbox, Grid, Absolute Positioning, Transforms)
- **State:** React useState (no external state management)
- **HTTP:** Axios for API calls
- **Development:** tsx for TypeScript execution, npm scripts for tasks

**The system is modular, extensible, and designed for multi-document-type support with customer-specific customization.**

---

## 📞 Need More Context?

If ChatGPT needs clarification on:
- Database queries → Check `backend/src/routes/pdfTemplateRoutes.ts`
- PDF generation → Check `backend/src/controllers/pdfGeneratorController.ts`
- UI interactions → Check `admin-ui/app/sections-builder/page.tsx`
- Styling approach → Check `admin-ui/app/sections-builder/sections.css`
- API contracts → Check `backend/src/routes/` directory

**All code follows TypeScript best practices with explicit typing, error handling, and modular structure.**

