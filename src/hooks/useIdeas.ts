import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Idea, IdeaStatus, IdeaPriority, EnergyLevel, TimeEstimate } from '@/types';
import { toast } from 'sonner';

export function useIdeas(userId: string | undefined) {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIdeas = useCallback(async () => {
    if (!userId) {
      setIdeas([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          content_type:content_types(*),
          platform:platforms(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to handle the joined data
      const typedData = (data || []).map(idea => ({
        ...idea,
        priority: idea.priority as IdeaPriority,
        status: idea.status as IdeaStatus,
      })) as Idea[];
      
      setIdeas(typedData);
    } catch (error) {
      console.error('Error fetching ideas:', error);
      toast.error('Failed to load ideas');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  const createIdea = useCallback(async (idea: Partial<Idea>): Promise<Idea | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('ideas')
        .insert({
          user_id: userId,
          title: idea.title || 'Untitled Idea',
          description: idea.description,
          content: idea.content,
          content_type_id: idea.content_type_id,
          platform_id: idea.platform_id,
          priority: idea.priority || 'none',
          status: idea.status || 'developing',
          is_timely: idea.is_timely || false,
          scheduled_date: idea.scheduled_date,
          source: idea.source || null,
          next_action: idea.next_action || null,
          energy_level: idea.energy_level || null,
          time_estimate: idea.time_estimate || null,
        })
        .select(`
          *,
          content_type:content_types(*),
          platform:platforms(*)
        `)
        .single();

      if (error) throw error;
      
      const typedData = {
        ...data,
        priority: data.priority as IdeaPriority,
        status: data.status as IdeaStatus,
      } as Idea;
      
      setIdeas(prev => [typedData, ...prev]);
      toast.success('Idea created!');
      return typedData;
    } catch (error) {
      console.error('Error creating idea:', error);
      toast.error('Failed to create idea');
      return null;
    }
  }, [userId]);

  const updateIdea = useCallback(async (id: string, updates: Partial<Idea>) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .update({
          title: updates.title,
          description: updates.description,
          content: updates.content,
          content_type_id: updates.content_type_id,
          platform_id: updates.platform_id,
          priority: updates.priority,
          status: updates.status,
          is_timely: updates.is_timely,
          scheduled_date: updates.scheduled_date,
          source: updates.source,
          next_action: updates.next_action,
          energy_level: updates.energy_level,
          time_estimate: updates.time_estimate,
        })
        .eq('id', id);

      if (error) throw error;

      // Refetch to get joined data
      const { data } = await supabase
        .from('ideas')
        .select(`
          *,
          content_type:content_types(*),
          platform:platforms(*)
        `)
        .eq('id', id)
        .single();

      if (data) {
        const typedData = {
          ...data,
          priority: data.priority as IdeaPriority,
          status: data.status as IdeaStatus,
        } as Idea;
        
        setIdeas(prev => prev.map(i => i.id === id ? typedData : i));
      }
      
      toast.success('Idea updated!');
    } catch (error) {
      console.error('Error updating idea:', error);
      toast.error('Failed to update idea');
    }
  }, []);

  const deleteIdea = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setIdeas(prev => prev.filter(i => i.id !== id));
      toast.success('Idea deleted!');
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error('Failed to delete idea');
    }
  }, []);

  return {
    ideas,
    loading,
    createIdea,
    updateIdea,
    deleteIdea,
    refetch: fetchIdeas,
  };
}
