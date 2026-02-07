import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ContentType } from '@/types';
import { toast } from 'sonner';

export function useContentTypes(userId: string | undefined) {
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContentTypes = useCallback(async () => {
    if (!userId) {
      setContentTypes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('content_types')
        .select('*')
        .eq('user_id', userId)
        .order('is_system', { ascending: false })
        .order('name');

      if (error) throw error;
      setContentTypes(data as ContentType[]);
    } catch (error) {
      console.error('Error fetching content types:', error);
      toast.error('Failed to load content types');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchContentTypes();
  }, [fetchContentTypes]);

  const createContentType = useCallback(async (name: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('content_types')
        .insert({
          user_id: userId,
          name,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      setContentTypes(prev => [...prev, data as ContentType]);
      toast.success('Content type created!');
    } catch (error) {
      console.error('Error creating content type:', error);
      toast.error('Failed to create content type');
    }
  }, [userId]);

  const updateContentType = useCallback(async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('content_types')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      setContentTypes(prev => prev.map(ct => ct.id === id ? { ...ct, name } : ct));
      toast.success('Content type updated!');
    } catch (error) {
      console.error('Error updating content type:', error);
      toast.error('Failed to update content type');
    }
  }, []);

  const deleteContentType = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('content_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setContentTypes(prev => prev.filter(ct => ct.id !== id));
      toast.success('Content type deleted!');
    } catch (error) {
      console.error('Error deleting content type:', error);
      toast.error('Failed to delete content type');
    }
  }, []);

  return {
    contentTypes,
    loading,
    createContentType,
    updateContentType,
    deleteContentType,
    refetch: fetchContentTypes,
  };
}
