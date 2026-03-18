-- Migrate all 'thought' records to 'quick_thought' so they appear in unified Notes tab
UPDATE public.systems SET note_type = 'quick_thought' WHERE note_type = 'thought';