# 🔧 Quick Fix for "Failed to fetch" Error

## Problem
You're getting these errors:
- "Network error: Unable to connect to authentication service"
- "Failed to fetch"

## Root Cause
The Supabase project URL `https://fxdeecqfkabeqsihspyo.supabase.co` is not responding. This means:
- The project might not exist anymore
- The project might be paused
- You need to create a fresh Supabase project

## Solution: Create a Fresh Supabase Project

### Step 1: Create New Supabase Project (3 minutes)

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Sign in or create account (it's free!)

2. **Create New Project**
   - Click "New Project"
   - Project Name: `kissan-kart` (or any name you like)
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for setup

3. **Get Your Credentials**
   - Once project is ready, go to **Settings > API**
   - Copy these two values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon/public key** (long string starting with `eyJ...`)

### Step 2: Update Your .env File (1 minute)

Open `.env` file and update with your new credentials:

```env
VITE_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...your-actual-key-here
```

**IMPORTANT**: Replace with YOUR actual values from Step 1!

### Step 3: Update supabase-client.ts (1 minute)

The file currently has hardcoded values. We need to use environment variables.

Open: `src/lib/supabase-client.ts`

Find lines 5-9 and replace with:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Step 4: Restart Dev Server (1 minute)

```bash
# Stop current dev server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Run Database Schema (3 minutes)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy entire contents of `supabase-schema.sql`
4. Paste into editor
5. Click **Run** button
6. Wait for success message

### Step 6: Enable Email Authentication (1 minute)

1. In Supabase dashboard, go to **Authentication > Providers**
2. Find **Email** provider
3. Toggle it **ON/Enabled**
4. **For testing**: Disable "Confirm email" (you can enable later)
5. Click **Save**

### Step 7: Test It! (2 minutes)

1. Open `test-auth.html` in your browser
2. You should see "✓ Connected to Supabase"
3. Try signing up with a test email
4. If it works, you're done! 🎉

## Alternative: Use Mock Authentication (Temporary)

If you want to test the app without Supabase right now:

### Option A: Use the fallback client

In `src/hooks/useAuth.tsx`, change line 4:

```typescript
// FROM:
import { supabase } from '@/lib/supabase-client';

// TO:
import { supabase } from '@/lib/supabase-with-fallback';
```

This will use mock authentication if Supabase is unavailable.

## Verification Checklist

After following the steps above:

- [ ] New Supabase project created
- [ ] Project URL and anon key copied
- [ ] .env file updated with new credentials
- [ ] supabase-client.ts using environment variables
- [ ] Dev server restarted
- [ ] Database schema deployed
- [ ] Email authentication enabled
- [ ] test-auth.html shows "Connected"
- [ ] Can sign up a test user
- [ ] Can sign in
- [ ] No "Failed to fetch" errors

## Still Having Issues?

### Check Internet Connection
```bash
# Test if you can reach supabase.com
curl -I https://supabase.com
```

### Check Environment Variables Loading
Add this to `src/lib/supabase-client.ts` temporarily:

```typescript
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Anon Key exists:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Check browser console to verify they're loading.

### Clear Cache
Sometimes Vite caches old values:
```bash
# Stop dev server
# Delete cache
rm -rf node_modules/.vite

# Restart
npm run dev
```

## Need Help?

1. Check `SETUP-GUIDE.md` for detailed setup
2. Check browser console for error details
3. Check Supabase logs in dashboard
4. Verify .env file is in root directory (not in src/)

## Quick Reference

**File Locations:**
- Environment vars: `.env` (root directory)
- Supabase client: `src/lib/supabase-client.ts`
- Auth hook: `src/hooks/useAuth.tsx`
- Test page: `test-auth.html`
- Schema: `supabase-schema.sql`

**Common Commands:**
```bash
npm run dev          # Start dev server
npm run build        # Build for production
start test-auth.html # Test connection (Windows)
```

**Supabase Dashboard URLs:**
- Projects: https://supabase.com/dashboard
- SQL Editor: https://supabase.com/dashboard/project/_/sql
- Auth Settings: https://supabase.com/dashboard/project/_/auth/providers
- API Settings: https://supabase.com/dashboard/project/_/settings/api

---

**Expected Result**: After following these steps, you should be able to sign up, sign in, and use all authentication features without any "Failed to fetch" errors! ✅
