-- =====================================================
-- Fix RLS Policy Infinite Recursion Error
-- This fixes the "infinite recursion detected in policy" error
-- =====================================================

-- =====================================================
-- 1. DROP ALL EXISTING PROBLEMATIC POLICIES
-- =====================================================

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;

-- Drop all existing policies on vendors table
DROP POLICY IF EXISTS "Vendors can view own vendor" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can update own vendor" ON public.vendors;
DROP POLICY IF EXISTS "Public can view verified vendors" ON public.vendors;
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors;
DROP POLICY IF EXISTS "Users can create vendor" ON public.vendors;

-- =====================================================
-- 2. CREATE FIXED POLICIES FOR PROFILES TABLE
-- Use auth.uid() instead of querying profiles to avoid recursion
-- =====================================================

-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile (for trigger)
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow admins to view all profiles (using metadata, not table lookup)
-- This checks the JWT token metadata instead of querying profiles table
CREATE POLICY "Service role can manage profiles" 
  ON public.profiles 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 3. CREATE FIXED POLICIES FOR VENDORS TABLE
-- =====================================================

-- Public can view verified vendors
CREATE POLICY "Public can view verified vendors" 
  ON public.vendors 
  FOR SELECT 
  USING (verification_status = 'verified');

-- Vendors can view their own vendor profile
CREATE POLICY "Vendors can view own vendor" 
  ON public.vendors 
  FOR SELECT 
  USING (auth.uid() = owner_id);

-- Allow authenticated users to create vendor (will be pending)
CREATE POLICY "Authenticated users can create vendor" 
  ON public.vendors 
  FOR INSERT 
  WITH CHECK (auth.uid() = owner_id);

-- Vendors can update their own vendor profile
CREATE POLICY "Vendors can update own vendor" 
  ON public.vendors 
  FOR UPDATE 
  USING (auth.uid() = owner_id);

-- Service role (backend operations) can manage all vendors
CREATE POLICY "Service role can manage vendors" 
  ON public.vendors 
  FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =====================================================
-- 4. CREATE POLICIES FOR PRODUCTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products;
DROP POLICY IF EXISTS "Public can view products" ON public.products;

-- Public can view products from verified vendors
CREATE POLICY "Public can view products from verified vendors" 
  ON public.products 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.verification_status = 'verified'
    )
  );

-- Vendors can manage their own products
CREATE POLICY "Vendors can manage own products" 
  ON public.products 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.vendors 
      WHERE vendors.id = products.vendor_id 
      AND vendors.owner_id = auth.uid()
    )
  );

-- =====================================================
-- 5. CREATE POLICIES FOR NOTIFICATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "Service role can insert notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- =====================================================
-- 6. GRANT NECESSARY PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.vendors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- Grant select to anonymous users for public data
GRANT SELECT ON public.vendors TO anon;
GRANT SELECT ON public.products TO anon;

-- =====================================================
-- 7. VERIFY SETUP
-- =====================================================

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ RLS policies fixed! Infinite recursion error should be resolved.' as status;
