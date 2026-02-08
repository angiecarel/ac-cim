import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ContentTemplate {
  id: string;
  user_id: string;
  name: string;
  content_type_id: string | null;
  template_content: string;
  is_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useContentTemplates(userId: string | undefined) {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTemplates = useCallback(async () => {
    if (!userId) {
      setTemplates([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTemplates((data as ContentTemplate[]) || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = useCallback(async (
    name: string,
    templateContent: string,
    contentTypeId?: string | null
  ) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('content_templates')
        .insert({
          user_id: userId,
          name,
          template_content: templateContent,
          content_type_id: contentTypeId || null,
        })
        .select()
        .single();

      if (error) throw error;
      setTemplates(prev => [...prev, data as ContentTemplate]);
      toast.success('Template created!');
      return data as ContentTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
      return null;
    }
  }, [userId]);

  const updateTemplate = useCallback(async (
    id: string,
    updates: Partial<Pick<ContentTemplate, 'name' | 'template_content' | 'content_type_id' | 'is_default'>>
  ) => {
    try {
      const { error } = await supabase
        .from('content_templates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      toast.success('Template updated!');
    } catch (error) {
      console.error('Error updating template:', error);
      toast.error('Failed to update template');
    }
  }, []);

  const deleteTemplate = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted!');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  }, []);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch: fetchTemplates,
  };
}
