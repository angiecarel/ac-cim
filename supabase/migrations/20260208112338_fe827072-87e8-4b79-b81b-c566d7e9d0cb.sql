
-- Create tags table (replacing platforms for more flexible categorization)
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create idea_tags junction table for many-to-many relationship
CREATE TABLE public.idea_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  idea_id UUID NOT NULL REFERENCES public.ideas(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(idea_id, tag_id)
);

-- Enable RLS on tags table
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tags
CREATE POLICY "Users can view their own tags" ON public.tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tags" ON public.tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tags" ON public.tags FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own non-system tags" ON public.tags FOR DELETE USING ((auth.uid() = user_id) AND (is_system = false));

-- Enable RLS on idea_tags table
ALTER TABLE public.idea_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for idea_tags
CREATE POLICY "Users can view their own idea tags" ON public.idea_tags FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own idea tags" ON public.idea_tags FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own idea tags" ON public.idea_tags FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger for tags
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Update handle_new_user function to create default tags (consolidating social media)
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
  
  RETURN NEW;
END;
$function$;
