-- Add color column to systems table for quick notes organization
ALTER TABLE public.systems ADD COLUMN color TEXT DEFAULT NULL;