-- Create junction table for system note tags
CREATE TABLE public.system_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  system_id UUID NOT NULL REFERENCES public.systems(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(system_id, tag_id)
);

-- Enable RLS
ALTER TABLE public.system_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own system tags" 
ON public.system_tags 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own system tags" 
ON public.system_tags 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own system tags" 
ON public.system_tags 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add entry_date column for explicit journal dates
ALTER TABLE public.systems ADD COLUMN entry_date DATE DEFAULT CURRENT_DATE;

-- Add mood column for journal entries
ALTER TABLE public.systems ADD COLUMN mood TEXT;