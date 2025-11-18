# 🔧 Environment Variables Fix Guide

## ❌ Current Variables (WRONG):
Based on your Vercel dashboard, you have:
1. `NEXT_PUBLIC_SUPABASE_URL` ❌
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` ❌  
3. `OPENAI_API_KEY` ✅

## ✅ Required Variables (CORRECT):
The code expects these exact names:
1. `SUPABASE_URL` (NOT `NEXT_PUBLIC_SUPABASE_URL`)
2. `SUPABASE_SERVICE_ROLE_KEY` (NOT `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. `OPENAI_API_KEY` ✅ (This one is correct!)

## 📋 Step-by-Step Fix:

### Step 1: Add Correct Supabase Variables

In Vercel Dashboard → Settings → Environment Variables:

1. **Click "Add New"** button
2. **Add `SUPABASE_URL`:**
   - Name: `SUPABASE_URL`
   - Value: Copy the value from your existing `NEXT_PUBLIC_SUPABASE_URL`
   - Environment: Select "All Environments" (Production, Preview, Development)
   - Click "Save"

3. **Add `SUPABASE_SERVICE_ROLE_KEY`:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Copy the value from your existing `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Environment: Select "All Environments"
   - Click "Save"

### Step 2: Verify OPENAI_API_KEY

- Make sure `OPENAI_API_KEY` exists
- Click the eye icon 👁️ to verify it has a value (starts with `sk-proj-` or `sk-`)

### Step 3: Remove Old Variables (Optional but Recommended)

After adding the correct ones, you can delete:
- `NEXT_PUBLIC_SUPABASE_URL` (not used by server-side code)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not used by server-side code)

### Step 4: Redeploy

**IMPORTANT:** After adding/changing environment variables, you MUST redeploy:

1. Go to **Deployments** tab in Vercel
2. Click the **three dots (...)** on the latest deployment
3. Click **"Redeploy"**
4. Or push a new commit to trigger auto-deploy

## 🔍 Why This Happens:

- `NEXT_PUBLIC_*` variables are for **client-side** (browser) code
- Your API routes run **server-side** and need regular environment variables
- The code reads `process.env.SUPABASE_URL`, not `process.env.NEXT_PUBLIC_SUPABASE_URL`

## ✅ Final Checklist:

After fixing, you should have exactly these 3 variables:
- [ ] `SUPABASE_URL` = `https://flnasqwstsztnicmmnvg.supabase.co`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGci...` (long JWT token)
- [ ] `OPENAI_API_KEY` = `sk-proj-...` or `sk-...`

## 🚨 Common Mistakes:

1. ❌ Using `NEXT_PUBLIC_` prefix for server-side variables
2. ❌ Using `SUPABASE_ANON_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`
3. ❌ Forgetting to redeploy after adding variables
4. ❌ Setting variables only for "Production" but testing on "Preview"

Make sure all variables are set for **"All Environments"**!

