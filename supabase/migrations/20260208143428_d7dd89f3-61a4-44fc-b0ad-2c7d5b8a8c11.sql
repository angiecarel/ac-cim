-- Create table for custom note colors
CREATE TABLE public.note_colors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  hex_color TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.note_colors ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own note colors"
ON public.note_colors FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own note colors"
ON public.note_colors FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own note colors"
ON public.note_colors FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own note colors"
ON public.note_colors FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_note_colors_updated_at
BEFORE UPDATE ON public.note_colors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default colors for existing users
INSERT INTO public.note_colors (user_id, name, hex_color, sort_order)
SELECT DISTINCT user_id, 'Yellow', '#fef3c7', 0 FROM public.systems WHERE note_type = 'quick_thought'
UNION
SELECT DISTINCT user_id, 'Green', '#dcfce7', 1 FROM public.systems WHERE note_type = 'quick_thought'
UNION
SELECT DISTINCT user_id, 'Blue', '#dbeafe', 2 FROM public.systems WHERE note_type = 'quick_thought'
UNION
SELECT DISTINCT user_id, 'Purple', '#ede9fe', 3 FROM public.systems WHERE note_type = 'quick_thought'
UNION
SELECT DISTINCT user_id, 'Pink', '#fce7f3', 4 FROM public.systems WHERE note_type = 'quick_thought'
UNION
SELECT DISTINCT user_id, 'Orange', '#ffedd5', 5 FROM public.systems WHERE note_type = 'quick_thought'
UNION
SELECT DISTINCT user_id, 'Gray', '#f3f4f6', 6 FROM public.systems WHERE note_type = 'quick_thought';

-- Also add default colors via the handle_new_user function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Create default idea types (expanded for creative idea library)
  INSERT INTO public.content_types (user_id, name, is_system) VALUES
    (NEW.id, 'Content', true),
    (NEW.id, 'Business', true),
    (NEW.id, 'Product', true),
    (NEW.id, 'Automation', true),
    (NEW.id, 'Research', true),
    (NEW.id, 'Inspiration', true),
    (NEW.id, 'Personal', true);
  
  -- Create default contexts (consolidated, with social media as one category)
  INSERT INTO public.platforms (user_id, name, emoji) VALUES
    (NEW.id, 'Social Media', '📱'),
    (NEW.id, 'Website', '🌐'),
    (NEW.id, 'Internal', '🏠'),
    (NEW.id, 'Client-facing', '🤝'),
    (NEW.id, 'Product', '📦');

  -- Create default tags (new flexible tagging system)
  INSERT INTO public.tags (user_id, name, color, is_system) VALUES
    (NEW.id, 'Social Media', '#3b82f6', true),
    (NEW.id, 'Website', '#22c55e', true),
    (NEW.id, 'Internal', '#8b5cf6', true),
    (NEW.id, 'Client', '#f59e0b', true),
    (NEW.id, 'Product', '#ec4899', true),
    (NEW.id, 'Quick Win', '#10b981', true),
    (NEW.id, 'High Priority', '#ef4444', true),
    (NEW.id, 'Needs Research', '#6366f1', true);

  -- Create default note colors
  INSERT INTO public.note_colors (user_id, name, hex_color, sort_order) VALUES
    (NEW.id, 'Yellow', '#fef3c7', 0),
    (NEW.id, 'Green', '#dcfce7', 1),
    (NEW.id, 'Blue', '#dbeafe', 2),
    (NEW.id, 'Purple', '#ede9fe', 3),
    (NEW.id, 'Pink', '#fce7f3', 4),
    (NEW.id, 'Orange', '#ffedd5', 5),
    (NEW.id, 'Gray', '#f3f4f6', 6);
  
  RETURN NEW;
END;
$function$;