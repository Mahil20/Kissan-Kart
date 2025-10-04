-- =====================================================
-- Fix Vendors Table Schema
-- Add missing columns that the app expects
-- =====================================================

-- Add missing columns to vendors table
ALTER TABLE public.vendors 
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS pin_code TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS contact_email TEXT,
  ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_pin_code ON public.vendors(pin_code);
CREATE INDEX IF NOT EXISTS idx_vendors_contact_email ON public.vendors(contact_email);

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'vendors' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Success message
SELECT 'Vendors table updated successfully!' as status;
