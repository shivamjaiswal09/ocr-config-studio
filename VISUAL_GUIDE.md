# 📱 Visual Setup Guide

## One Command to Rule Them All! 🎯

I've automated **everything** for you. Just follow these simple steps:

---

## Step-by-Step (Copy-Paste)

### 1️⃣ Open Terminal

**Mac:** Press `Cmd + Space`, type "Terminal", press Enter

---

### 2️⃣ Copy and Paste This Command

```bash
cd "/Users/admin/Desktop/PDF template" && ./setup.sh
```

**Press Enter**

---

### 3️⃣ What Will Happen

The script will display progress like this:

```
==========================================
PDF Template Engine - Automated Setup
==========================================

→ Step 1/7: Checking Homebrew...
✓ Homebrew installed

→ Step 2/7: Checking Node.js...
✓ Node.js installed: v18.x.x

→ Step 3/7: Checking PostgreSQL...
✓ PostgreSQL installed

→ Step 4/7: Starting PostgreSQL...
✓ PostgreSQL is running

→ Step 5/7: Setting up database...
✓ Database 'pdf_template_engine' created

→ Step 6/7: Installing application dependencies...
✓ Dependencies installed

→ Step 7/7: Running database migrations...
✓ Database tables created

==========================================
🎉 Setup Complete!
==========================================

Starting the server...

API will be available at: http://localhost:3000

Press Ctrl+C to stop the server

==========================================

🚀 PDF Template Engine running on port 3000
```

---

### 4️⃣ You Might Be Asked For:

**Your Mac password** - This is needed to install Homebrew and PostgreSQL
- Just type your password (you won't see it - that's normal)
- Press Enter
- The script continues automatically

---

### 5️⃣ When You See This - It's Ready! ✅

```
🚀 PDF Template Engine running on port 3000
📄 API: http://localhost:3000/api
🏥 Health: http://localhost:3000/health
```

---

## Test It Works 🧪

**Open a NEW terminal window** (don't close the one running the server!)

Copy and paste:

```bash
curl http://localhost:3000/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

---

## Generate Your First PDF 📄

In the same new terminal:

```bash
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
```

**You'll get a response with a `pdf_url`** - copy it and paste in your browser to see the PDF!

---

## Optional: Admin UI (Visual Interface) 🎨

In **another new terminal:**

```bash
cd "/Users/admin/Desktop/PDF template" && ./setup-admin.sh
```

Then open: **http://localhost:3001**

---

## Stop the Server 🛑

In the terminal where the server is running:
Press **Ctrl + C**

---

## Restart Later ♻️

Next time you want to start it:

```bash
cd "/Users/admin/Desktop/PDF template" && npm run dev
```

---

## The Magic Happens Here 🪄

```
setup.sh
└── Installs Homebrew
└── Installs Node.js
└── Installs PostgreSQL
└── Creates database
└── Installs dependencies
└── Creates tables
└── Starts server

ALL AUTOMATIC! ✨
```

---

## Checklist ✅

After running the setup script:

- [ ] Terminal shows "PDF Template Engine running on port 3000"
- [ ] `curl http://localhost:3000/health` returns OK
- [ ] You can generate a test PDF
- [ ] PDF opens in browser successfully

**All checked? You're ready to go!** 🎉

---

## Need Help?

**Script fails?** → Run it again: `./setup.sh`  
**Server won't start?** → Check if port 3000 is free  
**Database error?** → PostgreSQL might not be running  
**Other issues?** → Check logs in terminal

---

## Time Estimate ⏱️

- **First time setup**: 5-10 minutes (downloading & installing)
- **Starting server (later)**: 5 seconds
- **Generating PDF**: 1-2 seconds

---

## What You Get 🎁

✅ Full REST API for PDF generation  
✅ PostgreSQL database with tables  
✅ Default invoice template  
✅ Admin UI (optional)  
✅ Complete documentation  
✅ Test scripts  

**Ready to integrate with your Freight Invoicing, ePOD, Gate Pass apps!** 🚀

---

## The Command Again (Just in Case)

```bash
cd "/Users/admin/Desktop/PDF template" && ./setup.sh
```

**That's literally all you need to run!** 🎯

