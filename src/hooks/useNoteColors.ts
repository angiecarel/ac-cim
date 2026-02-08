import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface NoteColor {
  id: string;
  user_id: string;
  name: string;
  hex_color: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export function useNoteColors(userId: string | undefined) {
  const [colors, setColors] = useState<NoteColor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchColors = useCallback(async () => {
    if (!userId) {
      setColors([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('note_colors')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setColors((data as NoteColor[]) || []);
    } catch (error) {
      console.error('Error fetching note colors:', error);
      toast({
        title: 'Error',
        description: 'Failed to load note colors',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchColors();
  }, [fetchColors]);

  const createColor = async (name: string, hexColor: string) => {
    if (!userId) return null;

    try {
      const maxOrder = colors.length > 0 ? Math.max(...colors.map(c => c.sort_order)) : -1;
      
      const { data, error } = await supabase
        .from('note_colors')
        .insert({
          user_id: userId,
          name,
          hex_color: hexColor,
          sort_order: maxOrder + 1,
        })
        .select()
        .single();

      if (error) throw error;

      setColors(prev => [...prev, data as NoteColor]);
      toast({ title: 'Color added', description: `"${name}" has been added` });
      return data as NoteColor;
    } catch (error) {
      console.error('Error creating note color:', error);
      toast({
        title: 'Error',
        description: 'Failed to add color',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateColor = async (id: string, updates: { name?: string; hex_color?: string }) => {
    try {
      const { error } = await supabase
        .from('note_colors')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setColors(prev =>
        prev.map(c => (c.id === id ? { ...c, ...updates } : c))
      );
      toast({ title: 'Color updated' });
    } catch (error) {
      console.error('Error updating note color:', error);
      toast({
        title: 'Error',
        description: 'Failed to update color',
        variant: 'destructive',
      });
    }
  };

  const deleteColor = async (id: string) => {
    try {
      const { error } = await supabase
        .from('note_colors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setColors(prev => prev.filter(c => c.id !== id));
      toast({ title: 'Color removed' });
    } catch (error) {
      console.error('Error deleting note color:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove color',
        variant: 'destructive',
      });
    }
  };

  return {
    colors,
    loading,
    createColor,
    updateColor,
    deleteColor,
    refetch: fetchColors,
  };
}
