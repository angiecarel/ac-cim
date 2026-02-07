-- Create enums for status and priority
CREATE TYPE public.idea_status AS ENUM ('hold', 'developing', 'ready', 'scheduled', 'archived', 'recycled');
CREATE TYPE public.idea_priority AS ENUM ('none', 'good', 'better', 'best');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create content_types table
CREATE TABLE public.content_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create platforms table
CREATE TABLE public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '📱',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create ideas table
CREATE TABLE public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  content_type_id UUID REFERENCES public.content_types(id) ON DELETE SET NULL,
  platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
  priority idea_priority NOT NULL DEFAULT 'none',
  status idea_status NOT NULL DEFAULT 'developing',
  is_timely BOOLEAN NOT NULL DEFAULT false,
  scheduled_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create idea_files table for file attachments
CREATE TABLE public.idea_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_id UUID REFERENCES public.ideas(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create quicklinks table
CREATE TABLE public.quicklinks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  content_type_id UUID REFERENCES public.content_types(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quicklinks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Content types policies
CREATE POLICY "Users can view their own content types" ON public.content_types
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own content types" ON public.content_types
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own content types" ON public.content_types
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own content types" ON public.content_types
  FOR DELETE USING (auth.uid() = user_id AND is_system = false);

-- Platforms policies
CREATE POLICY "Users can view their own platforms" ON public.platforms
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own platforms" ON public.platforms
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own platforms" ON public.platforms
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own platforms" ON public.platforms
  FOR DELETE USING (auth.uid() = user_id);

-- Ideas policies
CREATE POLICY "Users can view their own ideas" ON public.ideas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ideas" ON public.ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ideas" ON public.ideas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ideas" ON public.ideas
  FOR DELETE USING (auth.uid() = user_id);

-- Idea files policies
CREATE POLICY "Users can view their own idea files" ON public.idea_files
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own idea files" ON public.idea_files
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own idea files" ON public.idea_files
  FOR DELETE USING (auth.uid() = user_id);

-- Quicklinks policies
CREATE POLICY "Users can view their own quicklinks" ON public.quicklinks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own quicklinks" ON public.quicklinks
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own quicklinks" ON public.quicklinks
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own quicklinks" ON public.quicklinks
  FOR DELETE USING (auth.uid() = user_id);

-- Create storage bucket for idea files
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('idea-files', 'idea-files', true, 1048576);

-- Storage policies for idea-files bucket
CREATE POLICY "Users can view their own idea files" ON storage.objects
  FOR SELECT USING (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own idea files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their own idea files" ON storage.objects
  FOR DELETE USING (bucket_id = 'idea-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_types_updated_at BEFORE UPDATE ON public.content_types
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_platforms_updated_at BEFORE UPDATE ON public.platforms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON public.ideas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_quicklinks_updated_at BEFORE UPDATE ON public.quicklinks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Create default content types
  INSERT INTO public.content_types (user_id, name, is_system) VALUES
    (NEW.id, 'Video', true),
    (NEW.id, 'Blog', true),
    (NEW.id, 'Podcast', true),
    (NEW.id, 'Social Post', true);
  
  -- Create default platforms
  INSERT INTO public.platforms (user_id, name, emoji) VALUES
    (NEW.id, 'YouTube', '📺'),
    (NEW.id, 'Instagram', '📸'),
    (NEW.id, 'TikTok', '🎵'),
    (NEW.id, 'Twitter', '🐦'),
    (NEW.id, 'LinkedIn', '💼'),
    (NEW.id, 'Website', '🌐');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();