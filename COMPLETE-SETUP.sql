-- =====================================================
-- COMPLETE SUPABASE SETUP FOR KISSAN-KART
-- Run this entire script in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: DROP EXISTING POLICIES (Clean Slate)
-- =====================================================

-- Drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Service role can manage profiles" ON public.profiles CASCADE;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles CASCADE;

DROP POLICY IF EXISTS "Vendors can view own vendor" ON public.vendors CASCADE;
DROP POLICY IF EXISTS "Vendors can update own vendor" ON public.vendors CASCADE;
DROP POLICY IF EXISTS "Public can view verified vendors" ON public.vendors CASCADE;
DROP POLICY IF EXISTS "Admins can view all vendors" ON public.vendors CASCADE;
DROP POLICY IF EXISTS "Users can create vendor" ON public.vendors CASCADE;
DROP POLICY IF EXISTS "Authenticated users can create vendor" ON public.vendors CASCADE;
DROP POLICY IF EXISTS "Service role can manage vendors" ON public.vendors CASCADE;

DROP POLICY IF EXISTS "Vendors can manage own products" ON public.products CASCADE;
DROP POLICY IF EXISTS "Public can view products" ON public.products CASCADE;
DROP POLICY IF EXISTS "Public can view products from verified vendors" ON public.products CASCADE;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications CASCADE;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications CASCADE;
DROP POLICY IF EXISTS "Service role can insert notifications" ON public.notifications CASCADE;

-- =====================================================
-- STEP 2: CREATE TABLES
-- =====================================================

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin', 'pending_vendor')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDORS TABLE (with all required columns)
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  pin_code TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  location JSONB,
  banner_image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  unit TEXT,
  stock_quantity INTEGER DEFAULT 0,
  image_url TEXT,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- STEP 3: CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

CREATE INDEX IF NOT EXISTS idx_vendors_owner_id ON public.vendors(owner_id);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON public.vendors(verification_status);
CREATE INDEX IF NOT EXISTS idx_vendors_pin_code ON public.vendors(pin_code);
CREATE INDEX IF NOT EXISTS idx_vendors_contact_email ON public.vendors(contact_email);

CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);

-- =====================================================
-- STEP 4: TEMPORARILY DISABLE RLS (For Testing)
-- =====================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: DROP AND RECREATE TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS on_vendor_updated ON public.vendors;
DROP TRIGGER IF EXISTS on_product_updated ON public.products;

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- Function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_vendor_updated
  BEFORE UPDATE ON public.vendors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_product_updated
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- STEP 6: GRANT PERMISSIONS
-- =====================================================

GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.vendors TO authenticated;
GRANT ALL ON public.products TO authenticated;
GRANT ALL ON public.notifications TO authenticated;

GRANT SELECT ON public.vendors TO anon;
GRANT SELECT ON public.products TO anon;

-- =====================================================
-- STEP 7: VERIFY SETUP
-- =====================================================

-- Check tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'vendors', 'products', 'notifications')
ORDER BY table_name;

-- Check triggers exist
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Success message
SELECT '✅ Database setup complete!' as status,
       '⚠️ RLS is DISABLED for testing' as warning,
       'You can now test your application' as next_step;
