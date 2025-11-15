# 🚀 Quick Deployment Guide - OCR Config Studio

## Prerequisites Check

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ Supabase project created
- ✅ OpenAI API key ready

## 🏃 Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
cd "/Users/admin/Desktop/PDF template"
npm install
```

### Step 2: Set Up Supabase Database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the contents of `supabase-schema.sql`
5. Click "Run" to execute the schema

### Step 3: Configure Environment Variables

Create a file named `.env.local` in the project root:

```bash
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-...
```

**Where to find these:**

- **SUPABASE_URL**: Supabase Dashboard → Settings → API → Project URL
- **SUPABASE_SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → service_role key (⚠️ Keep secret!)
- **OPENAI_API_KEY**: Already provided in your request

### Step 4: Run Locally

```bash
npm run dev
```

Open http://localhost:3000

### Step 5: Test the Application

1. Go to **Config Management** tab
2. Click "New Configuration"
3. Create a test config:
   - Document Type: `Freight Invoice`
   - Company ID: `TEST_COMPANY`
   - Add a few fields
   - Save
4. Go to **Run OCR** tab
5. Select your config
6. Click "Load Sample" to get demo data
7. Click "Run OCR"

## ☁️ Deploy to Vercel (3 minutes)

### Method 1: Via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - OCR Config Studio"
   git branch -M main
   git remote add origin https://github.com/shivamjaiswal09/ocr-config-studio.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Add environment variables:
     - `SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `OPENAI_API_KEY`
   - Click "Deploy"

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables when asked

# Deploy to production
vercel --prod
```

## 📋 Environment Variables for Vercel

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `SUPABASE_URL` | Your Supabase URL | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | Production, Preview, Development |
| `OPENAI_API_KEY` | Your OpenAI key | Production, Preview, Development |

## ✅ Post-Deployment Verification

1. Visit your deployed URL (e.g., `https://ocr-config-studio.vercel.app`)
2. Verify you can:
   - View the Config Management tab
   - Create a new configuration
   - Save it successfully
   - Go to Run OCR tab
   - Select the config
   - Run OCR with sample data
   - See results in both Mapped Payload and Raw JSON tabs

## 🐛 Common Issues & Solutions

### Issue: "Missing SUPABASE_URL environment variable"

**Solution:** Environment variables not set correctly. In Vercel:
1. Go to Project Settings → Environment Variables
2. Add all three variables
3. Redeploy: `vercel --prod` or trigger redeploy in dashboard

### Issue: "Config not found" when running OCR

**Solution:** Database schema not created. Run the SQL from `supabase-schema.sql` in Supabase SQL Editor.

### Issue: OpenAI API errors

**Solution:** 
- Verify API key is correct
- Check OpenAI account has available credits
- Ensure you're using a supported model (gpt-4o)

### Issue: Build fails on Vercel

**Solution:**
```bash
# Test build locally first
npm run build

# If it works locally, check Vercel logs for specific error
# Usually it's missing dependencies or type errors
```

## 📊 Monitoring & Logs

### View Logs on Vercel

1. Go to Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click on a deployment
4. View "Function Logs" for API route logs

### Database Monitoring

1. Go to Supabase Dashboard
2. Click "Database" → "Replication"
3. Monitor query performance
4. Check "Table Editor" to see data

## 🔒 Security Checklist

- ✅ `.env.local` is in `.gitignore`
- ✅ Service role key never exposed to client
- ✅ API routes are server-side only
- ✅ OpenAI API key stored securely in Vercel
- ✅ Supabase RLS policies (optional, for multi-user)

## 📈 Scaling Considerations

For production use:

1. **Add Authentication**: Implement NextAuth.js or Supabase Auth
2. **Enable RLS**: Add Row Level Security policies in Supabase
3. **Rate Limiting**: Add rate limiting to API routes
4. **Caching**: Cache config lookups
5. **Error Tracking**: Add Sentry or similar
6. **Monitoring**: Set up uptime monitoring

## 💰 Cost Estimation

- **Vercel**: Free tier supports hobby projects (100GB bandwidth/month)
- **Supabase**: Free tier includes 500MB database, 2GB bandwidth
- **OpenAI**: Depends on usage (~$0.01-0.03 per OCR run with gpt-4o)

## 🎉 You're Done!

Your OCR Config Studio is now deployed and ready to use. Create configurations and start processing documents!

---

Need help? Check `README_OCR_CONFIG_STUDIO.md` for detailed documentation.

