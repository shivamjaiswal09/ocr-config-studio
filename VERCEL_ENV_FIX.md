# Fix Vercel Environment Variables

## Current Issue
You have environment variables with `NEXT_PUBLIC_` prefix, but the code expects server-side variables without the prefix.

## Required Variables (Server-Side)

In Vercel Dashboard → Settings → Environment Variables, you need:

### ✅ Correct Variable Names:

1. **`OPENAI_API_KEY`** ✅ (You already have this)
   - Value: `sk-proj-...`

2. **`SUPABASE_URL`** ❌ (You have `NEXT_PUBLIC_SUPABASE_URL` - wrong name)
   - Value: Copy from `NEXT_PUBLIC_SUPABASE_URL`
   - Should be: `https://flnasqwstsztnicmmnvg.supabase.co`

3. **`SUPABASE_SERVICE_ROLE_KEY`** ❌ (You have `NEXT_PUBLIC_SUPABASE_ANON_KEY` - wrong name)
   - Value: Copy from `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Should be: `eyJhbGci...` (long JWT token)

## Steps to Fix:

1. **Add the correct variables:**
   - Click "Add New" in Vercel
   - Add `SUPABASE_URL` with value from `NEXT_PUBLIC_SUPABASE_URL`
   - Add `SUPABASE_SERVICE_ROLE_KEY` with value from `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **Verify OPENAI_API_KEY:**
   - Make sure `OPENAI_API_KEY` exists (you already have it)
   - Click the eye icon to verify the value is correct

3. **Remove old variables (optional but recommended):**
   - Delete `NEXT_PUBLIC_SUPABASE_URL`
   - Delete `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - (These won't be used by the server-side code)

4. **Redeploy:**
   - Go to Deployments tab
   - Click "Redeploy" on the latest deployment
   - Or push a new commit to trigger auto-deploy

## Why This Matters:

- `NEXT_PUBLIC_*` variables are exposed to the browser (client-side)
- Server-side API routes use regular environment variables
- The code uses `process.env.OPENAI_API_KEY` (not `NEXT_PUBLIC_OPENAI_API_KEY`)
- Supabase service role key must stay server-side (never use `NEXT_PUBLIC_` for secrets!)

## After Fix:

Once you've added the correct variables and redeployed, the error should be resolved.

