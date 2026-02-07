import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Platform } from '@/types';
import { toast } from 'sonner';

export function usePlatforms(userId: string | undefined) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlatforms = useCallback(async () => {
    if (!userId) {
      setPlatforms([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('platforms')
        .select('*')
        .eq('user_id', userId)
        .order('name');

      if (error) throw error;
      setPlatforms(data as Platform[]);
    } catch (error) {
      console.error('Error fetching platforms:', error);
      toast.error('Failed to load platforms');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const createPlatform = useCallback(async (name: string) => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('platforms')
        .insert({
          user_id: userId,
          name,
        })
        .select()
        .single();

      if (error) throw error;
      setPlatforms(prev => [...prev, data as Platform].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Platform created!');
    } catch (error) {
      console.error('Error creating platform:', error);
      toast.error('Failed to create platform');
    }
  }, [userId]);

  const updatePlatform = useCallback(async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('platforms')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
      setPlatforms(prev => prev.map(p => p.id === id ? { ...p, name } : p).sort((a, b) => a.name.localeCompare(b.name)));
      toast.success('Platform updated!');
    } catch (error) {
      console.error('Error updating platform:', error);
      toast.error('Failed to update platform');
    }
  }, []);

  const deletePlatform = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('platforms')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPlatforms(prev => prev.filter(p => p.id !== id));
      toast.success('Platform deleted!');
    } catch (error) {
      console.error('Error deleting platform:', error);
      toast.error('Failed to delete platform');
    }
  }, []);

  return {
    platforms,
    loading,
    createPlatform,
    updatePlatform,
    deletePlatform,
    refetch: fetchPlatforms,
  };
}
