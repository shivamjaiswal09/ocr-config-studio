# 🚀 START HERE - Automated Setup

I've created an **automated setup script** that will install and configure everything for you!

## What Will Be Installed

The script will automatically:
1. ✅ Install Homebrew (package manager)
2. ✅ Install Node.js 18
3. ✅ Install PostgreSQL 14
4. ✅ Create the database
5. ✅ Install all dependencies
6. ✅ Run database migrations
7. ✅ Start the server

**You don't need to do anything manually!**

---

## How to Run

### Step 1: Open Terminal

Open **Terminal** app (Applications → Utilities → Terminal)

### Step 2: Run the Setup Script

Copy and paste this command:

```bash
cd "/Users/admin/Desktop/PDF template" && ./setup.sh
```

Press **Enter**

### Step 3: Follow Prompts

- You may be asked for your **password** (for Homebrew installation)
- Just enter your Mac password and press Enter
- The script will do everything else automatically

### Step 4: Wait for Completion

The script will:
- Install everything needed (takes 5-10 minutes)
- Set up the database
- Start the server automatically

**When you see:**
```
🚀 PDF Template Engine running on port 3000
```

**The server is ready!** 🎉

---

## Test It!

Once the server is running, open a **new terminal window** and test:

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

The response will include a `pdf_url` - copy and paste it in your browser to see the PDF!

---

## Optional: Start Admin UI

If you want the visual admin interface, in a **new terminal** run:

```bash
cd "/Users/admin/Desktop/PDF template" && ./setup-admin.sh
```

Admin UI will be at: **http://localhost:3001**

---

## Summary of One Command

**Just run this:**

```bash
cd "/Users/admin/Desktop/PDF template" && ./setup.sh
```

That's it! Everything else is automatic. 🎉

---

## Stopping the Server

Press **Ctrl+C** in the terminal where the server is running.

---

## Troubleshooting

**Script fails?**
- Make sure you're connected to the internet
- Check that you entered your password correctly
- Run the script again: `./setup.sh`

**Need help?**
- Check the logs in the terminal
- Run: `./scripts/test-api.sh` to test the API

---

## What's Next?

Once running:
1. ✅ Test the API with the curl commands above
2. ✅ Open http://localhost:3000/health in browser
3. ✅ Start the admin UI (optional)
4. ✅ Integrate with your applications

**Everything is automated - just run the setup script!** 🚀

