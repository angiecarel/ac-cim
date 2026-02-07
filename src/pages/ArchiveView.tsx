import { useState, useMemo } from 'react';
import { useIdea } from '@/contexts/IdeaContext';
import { Idea } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViewIdeaDialog } from '@/components/ideas/ViewIdeaDialog';
import { EditIdeaDialog } from '@/components/ideas/EditIdeaDialog';
import { format } from 'date-fns';
import { Archive, Recycle, RotateCcw, Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ArchiveView() {
  const { ideas, restoreIdea, deleteIdea } = useIdea();
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const archivedIdeas = useMemo(() => 
    ideas.filter(idea => idea.status === 'archived')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [ideas]
  );

  const recycledIdeas = useMemo(() => 
    ideas.filter(idea => idea.status === 'recycled')
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()),
    [ideas]
  );

  const handleRestore = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    await restoreIdea(id);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setLoading(true);
    await deleteIdea(deletingId);
    setLoading(false);
    setDeletingId(null);
  };

  const renderIdeaList = (ideas: Idea[]) => {
    if (ideas.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Archive className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Nothing here</h3>
          <p className="text-muted-foreground">
            Archived and recycled ideas will appear here
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {ideas.map((idea) => (
          <Card
            key={idea.id}
            className="card-hover cursor-pointer"
            onClick={() => setViewingIdea(idea)}
          >
            <CardContent className="flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{idea.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>
                    Updated {format(new Date(idea.updated_at), 'MMM d, yyyy')}
                  </span>
                  {idea.content_type && (
                    <Badge variant="secondary" className="text-xs">
                      {idea.content_type.name}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleRestore(idea.id, e)}
                  disabled={loading}
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Restore
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeletingId(idea.id);
                  }}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Archive</h1>
        <p className="text-muted-foreground mt-1">
          Archived and recycled ideas
        </p>
      </div>

      <Tabs defaultValue="archived">
        <TabsList>
          <TabsTrigger value="archived" className="gap-2">
            <Archive className="h-4 w-4" />
            Archived ({archivedIdeas.length})
          </TabsTrigger>
          <TabsTrigger value="recycled" className="gap-2">
            <Recycle className="h-4 w-4" />
            Recycled ({recycledIdeas.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="archived" className="mt-6">
          {renderIdeaList(archivedIdeas)}
        </TabsContent>
        
        <TabsContent value="recycled" className="mt-6">
          {renderIdeaList(recycledIdeas)}
        </TabsContent>
      </Tabs>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the idea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialogs */}
      <ViewIdeaDialog
        idea={viewingIdea}
        open={!!viewingIdea}
        onOpenChange={(open) => !open && setViewingIdea(null)}
        onEdit={(idea) => {
          setViewingIdea(null);
          setEditingIdea(idea);
        }}
      />
      <EditIdeaDialog
        idea={editingIdea}
        open={!!editingIdea}
        onOpenChange={(open) => !open && setEditingIdea(null)}
      />
    </div>
  );
}
