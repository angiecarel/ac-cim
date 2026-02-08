-- Add is_pinned column to systems table for pin-to-top functionality
ALTER TABLE public.systems 
ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT false;

-- Create index for efficient pinned queries
CREATE INDEX idx_systems_is_pinned ON public.systems(user_id, is_pinned DESC, updated_at DESC);