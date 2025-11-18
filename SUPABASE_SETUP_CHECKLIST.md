# Supabase Setup Checklist

## Current Error: "Supabase not configured"

This error means the environment variables are either:
1. Not set in Vercel
2. Set with wrong names
3. Not redeployed after adding

## ✅ Required Environment Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

You need exactly these 3 variables (case-sensitive):

### 1. `SUPABASE_URL`
- **Value format:** `https://flnasqwstsztnicmmnvg.supabase.co`
- **Must:**
  - Start with `https://`
  - End with `.supabase.co`
  - No trailing slash
  - No `/dashboard` or `/api` paths
- **Where to get:** Supabase Dashboard → Settings → API → Project URL

### 2. `SUPABASE_SERVICE_ROLE_KEY`
- **Value format:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- **Must:** Be the service_role key (NOT anon key)
- **Where to get:** Supabase Dashboard → Settings → API → service_role key (⚠️ Keep secret!)

### 3. `OPENAI_API_KEY`
- **Value format:** `sk-proj-...` or `sk-...`
- **Where to get:** https://platform.openai.com/api-keys

## ❌ Common Mistakes

1. **Wrong variable names:**
   - ❌ `NEXT_PUBLIC_SUPABASE_URL` → ✅ `SUPABASE_URL`
   - ❌ `NEXT_PUBLIC_SUPABASE_ANON_KEY` → ✅ `SUPABASE_SERVICE_ROLE_KEY`

2. **Wrong URL format:**
   - ❌ `https://supabase.com/dashboard/project/...`
   - ❌ `https://app.supabase.com/...`
   - ✅ `https://flnasqwstsztnicmmnvg.supabase.co`

3. **Wrong key type:**
   - ❌ Using `anon` key → ✅ Use `service_role` key

4. **Not redeploying:**
   - After adding/changing variables, you MUST redeploy!

## 🔍 How to Verify

### Step 1: Check Variable Names
In Vercel, verify you have exactly:
- `SUPABASE_URL` (not `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_SERVICE_ROLE_KEY` (not `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- `OPENAI_API_KEY`

### Step 2: Check Variable Values
Click the eye icon 👁️ next to each variable to verify:
- `SUPABASE_URL` starts with `https://` and ends with `.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` is a long JWT token starting with `eyJ...`
- `OPENAI_API_KEY` starts with `sk-`

### Step 3: Check Environment Scope
Make sure all variables are set for **"All Environments"** (Production, Preview, Development)

### Step 4: Redeploy
After verifying, go to **Deployments** tab and click **"Redeploy"** on the latest deployment

## 🧪 Test After Fix

After fixing and redeploying, test the API:

```bash
curl https://your-vercel-url.vercel.app/api/configs
```

**Expected response:**
- If Supabase is configured: `[]` (empty array) or list of configs
- If Supabase is NOT configured: `[]` (empty array) - no error!

## 📝 Quick Fix Steps

1. **Go to Vercel Dashboard**
2. **Settings → Environment Variables**
3. **Add/Edit these variables:**
   - `SUPABASE_URL` = `https://flnasqwstsztnicmmnvg.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGci...` (your service role key)
   - `OPENAI_API_KEY` = `sk-proj-...` (your OpenAI key)
4. **Set all to "All Environments"**
5. **Redeploy** (Deployments → Redeploy)

## 🆘 Still Getting Error?

If you still get "Supabase not configured" after fixing:

1. **Check Vercel Function Logs:**
   - Go to Deployments → Latest deployment → Function Logs
   - Look for any errors about environment variables

2. **Verify Variable Names:**
   - They must be EXACTLY: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`
   - No typos, no extra spaces, no `NEXT_PUBLIC_` prefix

3. **Check URL Format:**
   - Must be: `https://[project-ref].supabase.co`
   - Your project ref: `flnasqwstsztnicmmnvg`
   - Full URL: `https://flnasqwstsztnicmmnvg.supabase.co`

4. **Verify Service Role Key:**
   - Must be the `service_role` key (not `anon` key)
   - Should be a very long string starting with `eyJhbGci...`

