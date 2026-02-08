import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { triggerZapierWebhook, ZAPIER_EVENTS } from '@/lib/zapier';

export type SystemNoteType = 'quick_thought' | 'journal_entry';

export interface SystemNote {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  note_type: SystemNoteType;
  platform_id: string | null;
  idea_id: string | null;
  entry_date: string | null;
  mood: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
}

export function useSystems(userId: string | undefined) {
  const [systems, setSystems] = useState<SystemNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState<string | null>(null);

  // Load webhook URL on mount
  useEffect(() => {
    const loadWebhook = async () => {
      if (!userId) return;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('zapier_webhook_url')
          .eq('user_id', userId)
          .single();
        setWebhookUrl(data?.zapier_webhook_url || null);
      } catch (error) {
        console.error('Error loading webhook URL:', error);
      }
    };
    loadWebhook();
  }, [userId]);

  const fetchSystems = useCallback(async () => {
    if (!userId) {
      setSystems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('systems')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setSystems((data as SystemNote[]) || []);
    } catch (error) {
      console.error('Error fetching systems:', error);
      toast({
        title: 'Error',
        description: 'Failed to load systems',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  const createSystem = useCallback(
    async (system: Partial<SystemNote>) => {
      if (!userId) return null;

      try {
        const { data, error } = await supabase
          .from('systems')
          .insert({
            user_id: userId,
            title: system.title || 'Untitled',
            content: system.content || null,
            note_type: system.note_type || 'quick_thought',
            platform_id: system.platform_id || null,
            idea_id: system.idea_id || null,
            entry_date: system.entry_date || null,
            mood: system.mood || null,
            color: system.color || null,
          })
          .select()
          .single();

        if (error) throw error;
        setSystems((prev) => [data as SystemNote, ...prev]);
        toast({ title: 'Note created' });
        
        // Trigger Zapier webhook
        if (webhookUrl) {
          const eventType = system.note_type === 'journal_entry' 
            ? ZAPIER_EVENTS.JOURNAL_ENTRY_CREATED 
            : ZAPIER_EVENTS.QUICK_NOTE_CREATED;
          await triggerZapierWebhook(webhookUrl, eventType, {
            id: (data as SystemNote).id,
            title: (data as SystemNote).title,
            type: system.note_type,
            platform_id: system.platform_id,
            idea_id: system.idea_id,
          });
        }
        
        return data as SystemNote;
      } catch (error) {
        console.error('Error creating system:', error);
        toast({
          title: 'Error',
          description: 'Failed to create note',
          variant: 'destructive',
        });
        return null;
      }
    },
    [userId, webhookUrl]
  );

  const updateSystem = useCallback(
    async (id: string, updates: Partial<SystemNote>) => {
      try {
        const { error } = await supabase
          .from('systems')
          .update(updates)
          .eq('id', id);

        if (error) throw error;
        setSystems((prev) =>
          prev.map((s) => (s.id === id ? { ...s, ...updates, updated_at: new Date().toISOString() } : s))
        );
        toast({ title: 'Note updated' });
        
        // Trigger Zapier webhook
        if (webhookUrl) {
          const note = systems.find((s) => s.id === id);
          if (note) {
            const eventType = note.note_type === 'journal_entry' 
              ? ZAPIER_EVENTS.JOURNAL_ENTRY_UPDATED 
              : ZAPIER_EVENTS.QUICK_NOTE_UPDATED;
            await triggerZapierWebhook(webhookUrl, eventType, {
              id,
              title: updates.title || note.title,
              type: note.note_type,
              platform_id: updates.platform_id ?? note.platform_id,
              idea_id: updates.idea_id ?? note.idea_id,
            });
          }
        }
      } catch (error) {
        console.error('Error updating system:', error);
        toast({
          title: 'Error',
          description: 'Failed to update note',
          variant: 'destructive',
        });
      }
    },
    [webhookUrl, systems]
  );

  const deleteSystem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('systems').delete().eq('id', id);

      if (error) throw error;
      setSystems((prev) => prev.filter((s) => s.id !== id));
      toast({ title: 'Note deleted' });
    } catch (error) {
      console.error('Error deleting system:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete note',
        variant: 'destructive',
      });
    }
  }, []);

  return {
    systems,
    loading,
    createSystem,
    updateSystem,
    deleteSystem,
    refetch: fetchSystems,
  };
}
