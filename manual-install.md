# Manual Installation Guide

Since the automated script requires password access, here's how to install everything manually (no password prompts in terminal).

## Step 1: Install Node.js (5 minutes)

### Option A: Download from Website (Easiest)

1. **Visit:** https://nodejs.org/
2. **Click:** "18.x LTS" (green button)
3. **Download** the `.pkg` installer for macOS
4. **Double-click** the downloaded file
5. **Follow** the installer (click Continue → Install)
6. **Verify:** Open new Terminal and type: `node --version`

### Option B: Using Homebrew (if you already have it)

```bash
brew install node@18
```

---

## Step 2: Install PostgreSQL (5 minutes)

### Option A: Postgres.app (EASIEST - No Configuration)

1. **Visit:** https://postgresapp.com/
2. **Download** Postgres.app
3. **Drag** to Applications folder
4. **Open** Postgres.app
5. **Click** "Initialize" to start the server
6. **Keep it running** (it will show an elephant icon in menu bar)

### Option B: Official Installer

1. **Visit:** https://www.postgresql.org/download/macosx/
2. **Download** PostgreSQL 14 for macOS
3. **Install** following the wizard
4. **Remember** the password you set

### Option C: Homebrew (if you have it)

```bash
brew install postgresql@14
brew services start postgresql@14
```

---

## Step 3: Verify Installation

Open a **new Terminal** window and run:

```bash
# Check Node.js
node --version
# Should show: v18.x.x

# Check npm
npm --version
# Should show: 9.x.x or higher

# Check PostgreSQL
psql --version
# Should show: psql (PostgreSQL) 14.x
```

If all three commands work, you're ready! ✅

---

## Step 4: Run the Simple Setup

Now that prerequisites are installed, run:

```bash
cd "/Users/admin/Desktop/PDF template"
chmod +x simple-setup.sh
./simple-setup.sh
```

This script:
- ✅ Doesn't require password
- ✅ Checks if Node.js and PostgreSQL are installed
- ✅ Installs npm dependencies
- ✅ Creates the database
- ✅ Runs migrations
- ✅ Starts the server

---

## Step 5: Test It Works

Once the server is running, open a **new terminal** and test:

```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok",...}`

---

## Troubleshooting

### "node: command not found"

**Solution:** Close and reopen Terminal after installing Node.js

### "psql: command not found" (Postgres.app)

**Solution:** Add to PATH. Run:

```bash
sudo mkdir -p /etc/paths.d &&
echo /Applications/Postgres.app/Contents/Versions/latest/bin | sudo tee /etc/paths.d/postgresapp
```

Then restart Terminal.

### "createdb: command not found"

**Solution:** PostgreSQL not in PATH. Using Postgres.app? Use the built-in CLI:
1. Open Postgres.app
2. Double-click a database
3. In the window, type: `CREATE DATABASE pdf_template_engine;`

### Port 3000 already in use

**Solution:** 
```bash
lsof -ti:3000 | xargs kill -9
```

---

## Alternative: Use Existing PostgreSQL

If you already have PostgreSQL installed but with different credentials:

Edit the `.env` file:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pdf_template_engine
DB_USER=your_username
DB_PASSWORD=your_password
```

Then create the database:

```bash
psql -U your_username -c "CREATE DATABASE pdf_template_engine;"
```

---

## Quick Reference

### Installation URLs

- **Node.js:** https://nodejs.org/
- **Postgres.app:** https://postgresapp.com/ (Easiest!)
- **PostgreSQL Official:** https://www.postgresql.org/download/macosx/

### After Installation

```bash
cd "/Users/admin/Desktop/PDF template"
./simple-setup.sh
```

### Test Commands

```bash
curl http://localhost:3000/health
curl "http://localhost:3000/api/pdf-template?document_type=invoice"
```

---

## Time Estimate

- Node.js install: 3 minutes
- PostgreSQL install: 3 minutes  
- App setup: 2 minutes
- **Total: ~8 minutes**

---

## Need Help?

1. Make sure you **restart Terminal** after installing Node.js/PostgreSQL
2. If Postgres.app is installed, make sure it's **running** (elephant icon in menu bar)
3. Run `./simple-setup.sh` - it will tell you what's missing

---

**Ready?** Install Node.js and PostgreSQL using the links above, then run `./simple-setup.sh`! 🚀

