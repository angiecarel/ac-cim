-- Add link_type column to quicklinks table
ALTER TABLE public.quicklinks 
ADD COLUMN IF NOT EXISTS link_type TEXT DEFAULT NULL;
