-- Create enum for system note types
CREATE TYPE system_note_type AS ENUM ('quick_thought', 'journal_entry');

-- Create systems table for best practices and notes
CREATE TABLE public.systems (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  note_type system_note_type NOT NULL DEFAULT 'quick_thought',
  platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.systems ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own systems"
  ON public.systems FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own systems"
  ON public.systems FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own systems"
  ON public.systems FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own systems"
  ON public.systems FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_systems_updated_at
  BEFORE UPDATE ON public.systems
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();