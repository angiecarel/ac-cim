-- Clear emojis from all platforms
UPDATE public.platforms SET emoji = '' WHERE emoji IS NOT NULL;