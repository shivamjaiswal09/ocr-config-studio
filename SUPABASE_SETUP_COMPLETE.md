# Complete Supabase Setup Guide

## Goal: Fetch Configs from Supabase

Follow these steps to enable Supabase integration:

---

## Step 1: Create Database Schema in Supabase

1. **Go to Supabase Dashboard:**
   - Visit https://supabase.com/dashboard
   - Select your project (project ref: `flnasqwstsztnicmmnvg`)

2. **Open SQL Editor:**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Schema:**
   - Open `supabase-schema.sql` file from this project
   - Copy ALL the SQL code
   - Paste it into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify Tables Created:**
   - Go to "Table Editor" in left sidebar
   - You should see two tables:
     - `ocr_configs` ✅
     - `ocr_runs` ✅

---

## Step 2: Get Your Supabase Credentials

1. **Go to Settings → API:**
   - In Supabase Dashboard, click "Settings" (gear icon)
   - Click "API" in the left menu

2. **Copy Project URL:**
   - Find "Project URL" section
   - Copy the URL (should be: `https://flnasqwstsztnicmmnvg.supabase.co`)
   - ✅ This is your `SUPABASE_URL`

3. **Copy Service Role Key:**
   - Scroll down to "Project API keys" section
   - Find "service_role" key (⚠️ Keep this secret!)
   - Click the eye icon to reveal it
   - Copy the entire key (starts with `eyJhbGci...`)
   - ✅ This is your `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 3: Set Environment Variables in Vercel

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project (`ocr-config-studio`)

2. **Navigate to Environment Variables:**
   - Click "Settings" tab
   - Click "Environment Variables" in left sidebar

3. **Add/Update Variables:**

   **Variable 1: `SUPABASE_URL`**
   - Click "Add New"
   - Key: `SUPABASE_URL` (exact, case-sensitive)
   - Value: `https://flnasqwstsztnicmmnvg.supabase.co`
   - Environment: Select "All Environments" ✅
   - Click "Save"

   **Variable 2: `SUPABASE_SERVICE_ROLE_KEY`**
   - Click "Add New"
   - Key: `SUPABASE_SERVICE_ROLE_KEY` (exact, case-sensitive)
   - Value: Paste your service_role key from Step 2
   - Environment: Select "All Environments" ✅
   - Click "Save"

   **Variable 3: `OPENAI_API_KEY`**
   - Verify it exists (you should already have this)
   - If missing, add it:
     - Key: `OPENAI_API_KEY`
     - Value: Your OpenAI API key (`sk-proj-...`)
     - Environment: Select "All Environments" ✅

4. **Verify All Variables:**
   - You should have exactly 3 variables:
     - ✅ `SUPABASE_URL`
     - ✅ `SUPABASE_SERVICE_ROLE_KEY`
     - ✅ `OPENAI_API_KEY`

---

## Step 4: Redeploy Your Application

**IMPORTANT:** After adding/changing environment variables, you MUST redeploy!

1. **Go to Deployments Tab:**
   - Click "Deployments" in top navigation
   - Find your latest deployment

2. **Redeploy:**
   - Click the three dots (...) on the latest deployment
   - Click "Redeploy"
   - Confirm the redeploy

   **OR** push a new commit to trigger auto-deploy:
   ```bash
   git commit --allow-empty -m "Trigger redeploy for Supabase config"
   git push origin main
   ```

---

## Step 5: Verify It's Working

### Test 1: Check API Endpoint

```bash
curl https://your-vercel-url.vercel.app/api/configs
```

**Expected Response:**
- If Supabase is configured: `[]` (empty array) or list of configs
- If Supabase is NOT configured: `[]` (empty array) - but check logs

### Test 2: Create a Config via API

```bash
curl -X POST https://your-vercel-url.vercel.app/api/configs \
  -H "Content-Type: application/json" \
  -d '{
    "document_type": "Freight Invoice",
    "company_id": "CNR-001",
    "apply_at_transporter_level": false,
    "fields": [
      {
        "field_label": "Invoice Number",
        "field_key": "invoice_number",
        "data_type": "string",
        "required": true,
        "payload_mapping_key": "invoice_number"
      }
    ],
    "prompt": "Extract invoice data"
  }'
```

**Expected Response:**
- Status: `201 Created`
- Body: JSON object with the created config (including `id`)

### Test 3: Verify in Supabase Dashboard

1. Go to Supabase Dashboard → Table Editor
2. Click on `ocr_configs` table
3. You should see the config you just created!

---

## Troubleshooting

### Still Getting "Supabase not configured"?

1. **Check Variable Names:**
   - Must be EXACTLY: `SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL`)
   - Must be EXACTLY: `SUPABASE_SERVICE_ROLE_KEY` (not `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

2. **Check Variable Values:**
   - `SUPABASE_URL` must start with `https://` and end with `.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` must be the service_role key (not anon key)

3. **Check Environment Scope:**
   - All variables must be set for "All Environments"

4. **Verify Redeploy:**
   - Check that you've redeployed after adding variables
   - Check deployment logs for any errors

5. **Check Vercel Function Logs:**
   - Go to Deployments → Latest → Function Logs
   - Look for any Supabase connection errors

### Getting Database Errors?

1. **Verify Schema is Created:**
   - Go to Supabase → Table Editor
   - Check that `ocr_configs` table exists

2. **Check Table Permissions:**
   - Supabase should allow service_role key to access tables
   - If using RLS (Row Level Security), you may need to disable it or add policies

---

## Quick Checklist

- [ ] Database schema created in Supabase (`ocr_configs` and `ocr_runs` tables exist)
- [ ] `SUPABASE_URL` set in Vercel (correct format: `https://[project-ref].supabase.co`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (service_role key, not anon key)
- [ ] `OPENAI_API_KEY` set in Vercel
- [ ] All variables set for "All Environments"
- [ ] Application redeployed after setting variables
- [ ] Tested API endpoint returns data (or empty array if no configs yet)

---

## Success Indicators

✅ **Working correctly when:**
- `/api/configs` returns `[]` or list of configs (no error)
- You can create configs via POST `/api/configs`
- Configs appear in Supabase Table Editor
- UI can fetch and display configs

❌ **Not working when:**
- Getting "Supabase not configured" error
- Getting HTML 404 page instead of JSON
- Database errors when creating configs

---

Once all steps are complete, your app will fetch configs from Supabase! 🎉

