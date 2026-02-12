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
  
  -- Create default idea types
  INSERT INTO public.content_types (user_id, name, is_system) VALUES
    (NEW.id, 'Content', false),
    (NEW.id, 'Research', false),
    (NEW.id, 'Biz Dev', false);
  
  -- Create default contexts
  INSERT INTO public.platforms (user_id, name, emoji) VALUES
    (NEW.id, 'Internal Use', '🏠'),
    (NEW.id, 'Client-Facing', '🤝'),
    (NEW.id, 'For Followers', '📱');

  -- Create default tags
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