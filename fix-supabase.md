# Supabase Token Issue Fix

## The Problem
The Supabase authentication is failing because the API key (anon token) may be expired or invalid.

## Solution Steps

### Step 1: Get Fresh Supabase Credentials
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project "fxdeecqfkabeqsihspyo"
4. Go to Settings → API
5. Copy the **Project URL** and **anon/public** key

### Step 2: Update the Configuration
Open `src/lib/supabase-client.ts` and update lines 6-7:

```typescript
const supabaseUrl = "https://fxdeecqfkabeqsihspyo.supabase.co";
const supabaseAnonKey = "YOUR_FRESH_ANON_KEY_HERE";
```

### Step 3: Alternative - Use Environment Variables
Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=https://fxdeecqfkabeqsihspyo.supabase.co
VITE_SUPABASE_ANON_KEY=your_fresh_anon_key_here
```

Then update `src/lib/supabase-client.ts`:

```typescript
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://fxdeecqfkabeqsihspyo.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "fallback_key";
```

### Step 4: Test
1. Save the changes
2. Run `npm run dev`
3. Visit `http://localhost:5173/test` to test the connection
4. Try signing up

## If You Don't Have Supabase Access
If you don't have access to the original Supabase project, you'll need to:
1. Create a new Supabase project
2. Set up the database schema
3. Update the URLs and keys accordingly
