-- =====================================================
-- QUICK FIX: Temporarily Disable RLS for Testing
-- Use this if you want to test quickly, then use fix-rls-policies.sql for production
-- =====================================================

-- Option 1: Temporarily disable RLS (FOR TESTING ONLY!)
-- This allows all operations without policy checks
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications DISABLE ROW LEVEL SECURITY;

SELECT '⚠️ RLS DISABLED - This is for testing only!' as warning;
SELECT 'Run fix-rls-policies.sql before going to production!' as important;

-- =====================================================
-- To re-enable RLS later (after testing), run:
-- =====================================================

-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
