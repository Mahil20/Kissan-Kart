# 🔧 Fix "Infinite Recursion in Policy" Error

## ❌ The Error

```
Error: Failed to insert vendor: infinite recursion detected in policy for relation "profiles"
```

## 🔍 What This Means

Row Level Security (RLS) policies are checking the `profiles` table while trying to insert into `vendors`, creating a circular reference:

```
Insert Vendor → Check if user is admin → Query profiles table → 
Check if user can access profiles → Query profiles table → 
Check if user is admin → Query profiles table → ∞
```

## ✅ Two Solutions (Choose One)

### 🚀 Solution 1: Quick Fix (For Testing - 30 seconds)

**Use this to test your app immediately, but NOT for production!**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Run this SQL**:

```sql
-- Temporarily disable RLS for testing
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

SELECT '✅ RLS Disabled - You can test now!' as status;
```

3. **Test your vendor form** - it should work!

⚠️ **WARNING**: This disables security. Use only for testing!

---

### 🛡️ Solution 2: Proper Fix (For Production - 2 minutes)

**Use this for a secure, production-ready setup.**

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy ALL the SQL from `fix-rls-policies.sql`**
3. **Paste and run** in SQL Editor
4. **Wait for** "✅ RLS policies fixed!" message

This will:
- Remove circular policy references
- Use JWT metadata instead of table lookups
- Keep your data secure
- Fix the recursion error

---

## 📋 Quick Test Script

**Copy this into Supabase SQL Editor:**

```sql
-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Fix vendors table policies
DROP POLICY IF EXISTS "Vendors can view own vendor" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update own vendor" ON public.vendors;
DROP POLICY IF EXISTS "Public can view verified vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors;

CREATE POLICY "Authenticated users can create vendor" 
  ON public.vendors FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Vendors can view own vendor" 
  ON public.vendors FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "Public can view verified vendors" 
  ON public.vendors FOR SELECT 
  USING (verification_status = 'verified');

SELECT '✅ Policies fixed!' as status;
```

---

## 🎯 Expected Result After Fix

**Before (Broken)**:
```
❌ 500 Internal Server Error
❌ infinite recursion detected in policy
❌ Cannot submit vendor form
```

**After (Working)**:
```
✅ No recursion errors
✅ Can submit vendor form
✅ Vendor created with pending status
✅ RLS still protecting your data
```

---

## 🔍 Understanding the Problem

### ❌ Bad Policy (Causes Recursion):

```sql
-- This checks profiles table to determine access to profiles table!
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles  -- 🔴 Querying profiles inside profiles policy!
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### ✅ Good Policy (No Recursion):

```sql
-- This uses auth.uid() directly, no table lookup
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);  -- ✅ No circular reference
```

---

## 📊 What Changed

| Before | After | Why |
|--------|-------|-----|
| Policy checks `profiles` table | Policy uses `auth.uid()` | Avoids recursion |
| Admin check queries database | Use JWT metadata | Faster & no recursion |
| Complex nested queries | Simple direct checks | Better performance |

---

## ✅ Verification Steps

After running the fix:

1. **Check policies exist**:
```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;
```

2. **Test vendor form**:
   - Go to `/become-vendor`
   - Fill out form
   - Submit
   - Should work! ✅

3. **Check vendor created**:
```sql
SELECT id, name, owner_id, verification_status 
FROM vendors 
ORDER BY created_at DESC 
LIMIT 5;
```

---

## 🐛 Still Getting Errors?

### Error: "permission denied for table vendors"

**Fix**: Grant permissions:
```sql
GRANT SELECT, INSERT, UPDATE ON public.vendors TO authenticated;
```

### Error: "new row violates row-level security policy"

**Fix**: Check your policy allows INSERT:
```sql
-- Make sure this exists:
CREATE POLICY "Authenticated users can create vendor" 
  ON public.vendors FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);
```

### Error: Still getting recursion

**Fix**: Temporarily disable RLS for testing:
```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
```

---

## 🎓 Best Practices for RLS Policies

### ✅ DO:
- Use `auth.uid()` for user checks
- Use `auth.jwt()` for role checks from metadata
- Keep policies simple and direct
- Test policies thoroughly

### ❌ DON'T:
- Query the same table in its own policy
- Create circular references between policies
- Use complex subqueries unless necessary
- Disable RLS in production

---

## 📞 Files Created

1. **fix-rls-policies.sql** - Complete RLS policy fix
2. **quick-fix-rls.sql** - Quick disable for testing
3. **FIX-INFINITE-RECURSION.md** - This guide

---

## 🚀 Recommended Approach

**For Development/Testing**:
1. Use `quick-fix-rls.sql` to disable RLS
2. Test all features work
3. Then enable RLS with proper policies

**For Production**:
1. Use `fix-rls-policies.sql` for secure policies
2. Test thoroughly
3. Never disable RLS in production

---

## ⏱️ Time Required

- **Quick Fix (Disable RLS)**: 30 seconds
- **Proper Fix (Fix Policies)**: 2 minutes
- **Testing**: 5 minutes

**Total**: ~7 minutes to complete fix

---

## 🎯 After This Fix

You'll be able to:
- ✅ Submit vendor registration forms
- ✅ Create vendors with pending status
- ✅ No infinite recursion errors
- ✅ Secure data access (with proper fix)
- ✅ Admin can approve/reject vendors

---

**Choose your solution above and run the SQL. The error will be fixed!** 🚀

**Recommendation**: Use Solution 1 (quick fix) NOW to test, then apply Solution 2 before deploying to production.
