import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tag } from '@/types';
import { toast } from 'sonner';

export function useTags(userId: string | undefined) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    if (!userId) {
      setTags([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error('Failed to load tags');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const createTag = useCallback(async (name: string, color: string = '#6366f1'): Promise<Tag | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: userId,
          name: name.trim(),
          color,
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;
      setTags(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Tag created!');
      return data;
    } catch (error) {
      console.error('Error creating tag:', error);
      toast.error('Failed to create tag');
      return null;
    }
  }, [userId]);

  const deleteTag = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTags(prev => prev.filter(t => t.id !== id));
      toast.success('Tag deleted!');
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Failed to delete tag');
    }
  }, []);

  return {
    tags,
    loading,
    createTag,
    deleteTag,
    refetch: fetchTags,
  };
}

export function useIdeaTags(userId: string | undefined) {
  const getIdeaTags = useCallback(async (ideaId: string): Promise<string[]> => {
    if (!userId) return [];

    try {
      const { data, error } = await supabase
        .from('idea_tags')
        .select('tag_id')
        .eq('idea_id', ideaId);

      if (error) throw error;
      return data?.map(it => it.tag_id) || [];
    } catch (error) {
      console.error('Error fetching idea tags:', error);
      return [];
    }
  }, [userId]);

  const setIdeaTags = useCallback(async (ideaId: string, tagIds: string[]) => {
    if (!userId) return;

    try {
      // Delete existing tags for this idea
      await supabase
        .from('idea_tags')
        .delete()
        .eq('idea_id', ideaId);

      // Insert new tags
      if (tagIds.length > 0) {
        const { error } = await supabase
          .from('idea_tags')
          .insert(
            tagIds.map(tagId => ({
              idea_id: ideaId,
              tag_id: tagId,
              user_id: userId,
            }))
          );

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating idea tags:', error);
      toast.error('Failed to update tags');
    }
  }, [userId]);

  return {
    getIdeaTags,
    setIdeaTags,
  };
}
