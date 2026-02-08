-- Update the handle_new_user function to include new idea types and contexts
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
  
  -- Create default contexts (expanded beyond social platforms)
  INSERT INTO public.platforms (user_id, name, emoji) VALUES
    (NEW.id, 'YouTube', '📺'),
    (NEW.id, 'Instagram', '📸'),
    (NEW.id, 'TikTok', '🎵'),
    (NEW.id, 'Twitter', '🐦'),
    (NEW.id, 'LinkedIn', '💼'),
    (NEW.id, 'Website', '🌐'),
    (NEW.id, 'Internal', '🏠'),
    (NEW.id, 'Client-facing', '🤝'),
    (NEW.id, 'Product', '📦');
  
  RETURN NEW;
END;
$function$;