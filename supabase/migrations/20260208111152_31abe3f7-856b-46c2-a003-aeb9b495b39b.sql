-- Add Source and Next Action fields for GTD-style idea capture
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS source TEXT DEFAULT NULL;
ALTER TABLE public.ideas ADD COLUMN IF NOT EXISTS next_action TEXT DEFAULT NULL;

-- Add comments for clarity
COMMENT ON COLUMN public.ideas.source IS 'Where the idea came from (e.g., podcast, conversation, shower thought)';
COMMENT ON COLUMN public.ideas.next_action IS 'The very next physical step to move this idea forward';