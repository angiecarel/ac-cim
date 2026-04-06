import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWorkflows } from '@/hooks/useWorkflows';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Plus, Trash2, Workflow, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function Workflows() {
  const { workflows, loading, createWorkflow, deleteWorkflow } = useWorkflows();
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  const handleCreate = async () => {
    const title = newTitle.trim() || 'Untitled Workflow';
    const wf = await createWorkflow(title);
    if (wf) {
      setNewTitle('');
      navigate(`/workflows/${wf.id}`);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (await deleteWorkflow(id)) {
      toast({ title: 'Workflow deleted' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-display">Workflows</h1>
        <p className="text-sm text-muted-foreground">Visual diagrams for systems, automations, and agent architectures</p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="New workflow title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          className="max-w-sm"
        />
        <Button onClick={handleCreate} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Create
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : workflows.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <Workflow className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No workflows yet. Create one to start diagramming.</p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((wf) => (
            <Card
              key={wf.id}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow group"
              onClick={() => navigate(`/workflows/${wf.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm truncate">{wf.title}</h3>
                  {wf.description && <p className="text-xs text-muted-foreground truncate mt-0.5">{wf.description}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Updated {format(new Date(wf.updated_at), 'MMM d, yyyy')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={(e) => handleDelete(e, wf.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
