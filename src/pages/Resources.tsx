import { useState } from 'react';
import { Plus, FileText, Search, Trash2, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/journal/RichTextEditor';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Resource {
  id: string;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export function Resources() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['resources', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('resources' as any)
        .select('*')
        .eq('user_id', user!.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      return (data || []) as Resource[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async ({ title, content }: { title: string; content: string }) => {
      const { error } = await supabase.from('resources' as any).insert({
        title,
        content,
        user_id: user!.id,
      } as any);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource created');
      resetForm();
      setIsCreateOpen(false);
    },
    onError: () => toast.error('Failed to create resource'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, title, content }: { id: string; title: string; content: string }) => {
      const { error } = await supabase.from('resources' as any).update({ title, content, updated_at: new Date().toISOString() } as any).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource updated');
      setEditingResource(null);
      resetForm();
    },
    onError: () => toast.error('Failed to update resource'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('resources').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['resources'] });
      toast.success('Resource deleted');
    },
    onError: () => toast.error('Failed to delete resource'),
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
  };

  const handleCreate = () => {
    if (!title.trim()) return toast.error('Title is required');
    createMutation.mutate({ title: title.trim(), content });
  };

  const handleUpdate = () => {
    if (!editingResource || !title.trim()) return;
    updateMutation.mutate({ id: editingResource.id, title: title.trim(), content });
  };

  const openEdit = (resource: Resource) => {
    setEditingResource(resource);
    setTitle(resource.title);
    setContent(resource.content || '');
  };

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  const contentPreview = (html: string | null) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">Create and manage your documents</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { setIsCreateOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Resource</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label htmlFor="res-title">Title</Label>
                <Input id="res-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Resource title" />
              </div>
              <div>
                <Label>Content</Label>
                <RichTextEditor content={content} onChange={setContent} placeholder="Write your resource content..." />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setIsCreateOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="pl-9" />
      </div>

      {isLoading ? (
        <div className="text-center text-muted-foreground py-12">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">{search ? 'No resources match your search' : 'No resources yet. Create your first one!'}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(resource => (
            <Card key={resource.id} className="group">
              <CardContent className="p-4 flex flex-col h-[160px]">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-base leading-tight truncate">{resource.title}</h3>
                  <div className="flex items-center gap-1 shrink-0 bg-background/80 backdrop-blur-sm rounded-md">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setViewingResource(resource)}>
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(resource)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteMutation.mutate(resource.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
                  {contentPreview(resource.content) || '\u00A0'}
                </p>
                <div className="mt-auto pt-2">
                  <span className="text-xs text-muted-foreground">
                    Updated {format(new Date(resource.updated_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingResource} onOpenChange={(open) => { if (!open) { setEditingResource(null); resetForm(); } }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Resource</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Content</Label>
              <RichTextEditor content={content} onChange={setContent} placeholder="Write your resource content..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setEditingResource(null); resetForm(); }}>Cancel</Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={!!viewingResource} onOpenChange={(open) => { if (!open) setViewingResource(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingResource?.title}</DialogTitle>
          </DialogHeader>
          {viewingResource && (
            <div className="prose prose-sm dark:prose-invert max-w-none pt-2" dangerouslySetInnerHTML={{ __html: viewingResource.content || '<p>No content</p>' }} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}