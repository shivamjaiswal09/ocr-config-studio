# How to Access Masked Environment Variables in Vercel

## Method 1: Vercel Dashboard (Easiest)

1. **Go to Vercel Dashboard:**
   - Visit https://vercel.com/dashboard
   - Select your project (`ocr-config-studio`)

2. **Navigate to Environment Variables:**
   - Click on **Settings** tab
   - Click on **Environment Variables** in the left sidebar

3. **View Masked Values:**
   - Click the **eye icon** 👁️ next to any masked variable
   - Or click directly on the masked value (shows as `••••••••`)
   - You may be prompted to enter your Vercel password or 2FA code
   - The value will be revealed temporarily

4. **Copy the Value:**
   - Once revealed, you can copy the full value
   - Click outside the field to mask it again

## Method 2: Vercel CLI

### Install Vercel CLI (if not installed):

```bash
npm install -g vercel
```

### Login to Vercel:

```bash
vercel login
```

### List Environment Variables:

```bash
# List all environment variables for your project
vercel env ls

# This will show variable names but NOT values (for security)
```

### Pull Environment Variables to Local File:

```bash
# Pull all environment variables to .env.local
vercel env pull .env.local

# This will download all env vars with their actual values
# ⚠️ Be careful - this file contains secrets!
```

### View Specific Environment Variable:

```bash
# View a specific variable (will show masked value)
vercel env ls | grep OPENAI_API_KEY

# To see actual value, use pull command above
```

## Method 3: Check from Your Source (If You Still Have Access)

If you set these variables recently, you might still have them in:

1. **Your local `.env.local` file** (if you created one)
2. **Your Supabase Dashboard** (for Supabase keys)
   - Go to: https://supabase.com/dashboard
   - Select your project → Settings → API
   - Copy the values from there

3. **Your OpenAI Dashboard** (for OpenAI key)
   - Go to: https://platform.openai.com/api-keys
   - View or regenerate your API key

## Security Notes

⚠️ **Important:**
- Masked values are hidden for security reasons
- Never commit `.env.local` or environment variable files to git
- If you need to share values, use secure methods (password managers, encrypted channels)
- If a key is compromised, regenerate it immediately

## Quick Reference: Where to Get Values

### `OPENAI_API_KEY`
- Source: https://platform.openai.com/api-keys
- Format: `sk-proj-...` or `sk-...`

### `SUPABASE_URL`
- Source: Supabase Dashboard → Settings → API → Project URL
- Format: `https://xxxxx.supabase.co`

### `SUPABASE_SERVICE_ROLE_KEY`
- Source: Supabase Dashboard → Settings → API → service_role key
- Format: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (long JWT token)
- ⚠️ Keep this secret - it has admin access to your database

## Troubleshooting

### Can't see the eye icon?
- Make sure you're logged in to Vercel
- Check that you have the correct project permissions
- Try refreshing the page

### CLI shows "not authenticated"?
```bash
vercel login
# Follow the prompts to authenticate
```

### Need to update a variable?
1. In Vercel Dashboard → Settings → Environment Variables
2. Click on the variable name
3. Click "Edit" or "Remove" and add new value
4. Redeploy your project for changes to take effect

