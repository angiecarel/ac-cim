import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { QuickLink } from '@/types';
import { toast } from 'sonner';

export function useQuickLinks(userId: string | undefined) {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQuickLinks = useCallback(async () => {
    if (!userId) {
      setQuickLinks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('quicklinks')
        .select(`
          *,
          content_type:content_types(*)
        `)
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setQuickLinks(data as QuickLink[]);
    } catch (error) {
      console.error('Error fetching quicklinks:', error);
      toast.error('Failed to load quicklinks');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchQuickLinks();
  }, [fetchQuickLinks]);

  const createQuickLink = useCallback(async (name: string, url: string, contentTypeId?: string | null) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('quicklinks')
        .insert({
          user_id: userId,
          name,
          url,
          content_type_id: contentTypeId || null,
        })
        .select(`
          *,
          content_type:content_types(*)
        `)
        .single();

      if (error) throw error;
      setQuickLinks(prev => [...prev, data as QuickLink].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('QuickLink created!');
    } catch (error) {
      console.error('Error creating quicklink:', error);
      toast.error('Failed to create quicklink');
    }
  }, [userId]);

  const updateQuickLink = useCallback(async (id: string, name: string, url: string, contentTypeId?: string | null) => {
    try {
      const { error } = await supabase
        .from('quicklinks')
        .update({ name, url, content_type_id: contentTypeId || null })
        .eq('id', id);

      if (error) throw error;
      
      // Refetch to get joined data
      const { data } = await supabase
        .from('quicklinks')
        .select(`
          *,
          content_type:content_types(*)
        `)
        .eq('id', id)
        .single();
      
      if (data) {
        setQuickLinks(prev => prev.map(ql => ql.id === id ? data as QuickLink : ql).sort((a, b) => a.name.localeCompare(b.name)));
      }
      
      toast.success('QuickLink updated!');
    } catch (error) {
      console.error('Error updating quicklink:', error);
      toast.error('Failed to update quicklink');
    }
  }, []);

  const deleteQuickLink = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('quicklinks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setQuickLinks(prev => prev.filter(ql => ql.id !== id));
      toast.success('QuickLink deleted!');
    } catch (error) {
      console.error('Error deleting quicklink:', error);
      toast.error('Failed to delete quicklink');
    }
  }, []);

  return {
    quickLinks,
    loading,
    createQuickLink,
    updateQuickLink,
    deleteQuickLink,
    refetch: fetchQuickLinks,
  };
}
