
# Supabase Database Schema for Farmers Market Finder

This document outlines the database schema needed for the Farmers Market Finder application.

## Tables

### 1. profiles
Stores user profile information.

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'vendor', 'admin')),
  favorites JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public profiles are viewable by everyone" 
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
```

### 2. vendors
Stores information about vendors/farmers.

```sql
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  location JSONB,
  address TEXT,
  pin_code TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  banner_image TEXT,
  profile_image TEXT,
  opening_hours JSONB
);

-- Enable Row Level Security
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Vendors are viewable by everyone" 
  ON vendors FOR SELECT USING (true);

CREATE POLICY "Vendors can insert their own record" 
  ON vendors FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Vendors can update their own record" 
  ON vendors FOR UPDATE USING (auth.uid() = owner_id OR 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Only admins can delete vendors" 
  ON vendors FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

### 3. products
Stores information about products offered by vendors.

```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  image_url TEXT,
  stock INTEGER NOT NULL DEFAULT 0,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Products are viewable by everyone" 
  ON products FOR SELECT USING (true);

CREATE POLICY "Vendors can insert their own products" 
  ON products FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND owner_id = auth.uid())
  );

CREATE POLICY "Vendors can update their own products" 
  ON products FOR UPDATE USING (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND owner_id = auth.uid())
  );

CREATE POLICY "Vendors can delete their own products" 
  ON products FOR DELETE USING (
    EXISTS (SELECT 1 FROM vendors WHERE id = vendor_id AND owner_id = auth.uid())
  );
```

### 4. reviews
Stores user reviews of vendors.

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vendor_id)
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Reviews are viewable by everyone" 
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can insert their own reviews" 
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON reviews FOR DELETE USING (auth.uid() = user_id);
```

### 5. Storage Buckets
Set up storage buckets for images and documents.

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Set up policies for images bucket (public access)
CREATE POLICY "Images are publicly accessible" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" 
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'images' AND owner = auth.uid());

-- Set up policies for documents bucket (restricted access)
CREATE POLICY "Only admins can access verification documents" 
  ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Vendors can upload their own documents" 
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');
```

## Initial Setup

### Admin User
Create an initial admin user through the Supabase dashboard Auth section, and then update their role:

```sql
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

### Sample Data
You can insert sample data to test the application:

```sql
-- Insert sample vendors
INSERT INTO vendors (owner_id, name, description, location, address, pin_code, contact_phone, contact_email, verification_status)
VALUES 
('USER_ID_HERE', 'Organic Farms', 'Family-owned farm specializing in organic produce', '{"lat": 28.6139, "lng": 77.2090}', 'Farm Road, Delhi', '110001', '+91 98765 43210', 'farm@example.com', 'verified');

-- Insert sample products
INSERT INTO products (vendor_id, name, description, price, unit, stock, category)
VALUES 
('VENDOR_ID_HERE', 'Organic Tomatoes', 'Fresh red tomatoes', 40, 'kg', 100, 'vegetables');
```

## Notes

1. Remember to replace placeholder values like 'USER_ID_HERE' with actual UUID values.
2. The schema includes Row Level Security (RLS) policies to ensure data access is properly restricted.
3. You'll need to enable the Supabase Auth service and configure email templates as needed.
4. For geographical queries, consider using PostGIS if your application scales.
