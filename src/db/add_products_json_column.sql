-- SQL script to add products_json column to vendors table
ALTER TABLE public.vendors ADD COLUMN products_json JSONB;
