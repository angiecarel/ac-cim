import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface WorkflowData {
  nodes: any[];
  edges: any[];
  viewport: { x: number; y: number; zoom: number };
}

export interface Workflow {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  workflow_data: WorkflowData;
  created_at: string;
  updated_at: string;
}

export function useWorkflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkflows = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('workflows' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading workflows', description: error.message, variant: 'destructive' });
    } else {
      setWorkflows((data as any[]) || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchWorkflows(); }, [fetchWorkflows]);

  const createWorkflow = async (title: string, description?: string) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from('workflows' as any)
      .insert({ user_id: user.id, title, description: description || null } as any)
      .select()
      .single();

    if (error) {
      toast({ title: 'Error creating workflow', description: error.message, variant: 'destructive' });
      return null;
    }
    await fetchWorkflows();
    return data as unknown as Workflow;
  };

  const updateWorkflow = async (id: string, updates: Partial<Pick<Workflow, 'title' | 'description' | 'workflow_data'>>) => {
    const { error } = await supabase
      .from('workflows' as any)
      .update(updates as any)
      .eq('id', id);

    if (error) {
      toast({ title: 'Error saving workflow', description: error.message, variant: 'destructive' });
      return false;
    }
    return true;
  };

  const deleteWorkflow = async (id: string) => {
    const { error } = await supabase
      .from('workflows' as any)
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error deleting workflow', description: error.message, variant: 'destructive' });
      return false;
    }
    await fetchWorkflows();
    return true;
  };

  const getWorkflow = async (id: string): Promise<Workflow | null> => {
    const { data, error } = await supabase
      .from('workflows' as any)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({ title: 'Error loading workflow', description: error.message, variant: 'destructive' });
      return null;
    }
    return data as unknown as Workflow;
  };

  return { workflows, loading, createWorkflow, updateWorkflow, deleteWorkflow, getWorkflow, refetch: fetchWorkflows };
}
