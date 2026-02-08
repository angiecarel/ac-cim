import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystems, SystemNote, SystemNoteType } from '@/hooks/useSystems';
import { useIdea } from '@/contexts/IdeaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus, StickyNote, BookOpen, Trash2, Edit, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function SystemsView() {
  const { user } = useAuth();
  const { systems, loading, createSystem, updateSystem, deleteSystem } = useSystems(user?.id);
  const { platforms, ideas } = useIdea();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SystemNote | null>(null);
  const [noteType, setNoteType] = useState<SystemNoteType>('quick_thought');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState<string>('');
  const [ideaId, setIdeaId] = useState<string>('');

  const quickThoughts = systems.filter((s) => s.note_type === 'quick_thought');
  const journalEntries = systems.filter((s) => s.note_type === 'journal_entry');

  const resetForm = () => {
    setTitle('');
    setContent('');
    setPlatformId('');
    setIdeaId('');
    setNoteType('quick_thought');
    setEditingNote(null);
  };

  const handleCreate = async () => {
    if (!title.trim()) return;
    await createSystem({
      title: title.trim(),
      content: content.trim() || null,
      note_type: noteType,
      platform_id: platformId || null,
      idea_id: ideaId || null,
    });
    resetForm();
    setIsAddOpen(false);
  };

  const handleUpdate = async () => {
    if (!editingNote || !title.trim()) return;
    await updateSystem(editingNote.id, {
      title: title.trim(),
      content: content.trim() || null,
      platform_id: platformId || null,
      idea_id: ideaId || null,
    });
    resetForm();
  };

  const openEdit = (note: SystemNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content || '');
    setPlatformId(note.platform_id || '');
    setIdeaId(note.idea_id || '');
    setNoteType(note.note_type);
  };

  const openAdd = (type: SystemNoteType) => {
    resetForm();
    setNoteType(type);
    setIsAddOpen(true);
  };

  const getLinkedPlatform = (platformId: string | null) => {
    if (!platformId) return null;
    return platforms.find((p) => p.id === platformId);
  };

  const getLinkedIdea = (ideaId: string | null) => {
    if (!ideaId) return null;
    return ideas.find((i) => i.id === ideaId);
  };

  // Filter out archived/recycled ideas for linking
  const linkableIdeas = ideas.filter((i) => !['archived', 'recycled'].includes(i.status));

  const NoteCard = ({ note, isSticky = false }: { note: SystemNote; isSticky?: boolean }) => {
    const platform = getLinkedPlatform(note.platform_id);
    const idea = getLinkedIdea(note.idea_id);

    return (
      <Card
        className={cn(
          'group relative card-hover',
          isSticky && 'bg-accent/50 border-accent'
        )}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-medium leading-tight">{note.title}</CardTitle>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(note)}>
                <Edit className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                onClick={() => deleteSystem(note.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {note.content && (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{note.content}</p>
          )}
          {(platform || idea) && (
            <div className="flex flex-wrap gap-2">
              {platform && (
                <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                  <span>{platform.emoji}</span>
                  {platform.name}
                </span>
              )}
              {idea && (
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Link2 className="h-3 w-3" />
                  {idea.title}
                </span>
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground">{format(new Date(note.updated_at), 'MMM d, yyyy')}</p>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Journal</h1>
          <p className="text-muted-foreground mt-1">Best practices, notes, and journal entries</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="quick" className="space-y-6">
        <TabsList>
          <TabsTrigger value="quick" className="gap-2">
            <StickyNote className="h-4 w-4" />
            Quick Thoughts
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Journal Entries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quick" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openAdd('quick_thought')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Quick Thought
            </Button>
          </div>
          {quickThoughts.length === 0 ? (
            <Card className="p-8 text-center">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quick thoughts yet. Capture a fleeting idea!</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {quickThoughts.map((note) => (
                <NoteCard key={note.id} note={note} isSticky />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="journal" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openAdd('journal_entry')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Journal Entry
            </Button>
          </div>
          {journalEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No journal entries yet. Document your systems!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {journalEntries.map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {noteType === 'quick_thought' ? (
                <>
                  <StickyNote className="h-5 w-5 text-accent-foreground" />
                  New Quick Thought
                </>
              ) : (
                <>
                  <BookOpen className="h-5 w-5 text-primary" />
                  New Journal Entry
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={noteType === 'quick_thought' ? 'Quick thought...' : 'Entry title...'}
              />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts..."
                rows={noteType === 'journal_entry' ? 8 : 4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Link to Context</Label>
                <Select value={platformId} onValueChange={setPlatformId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.emoji} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link to Idea</Label>
                <Select value={ideaId} onValueChange={setIdeaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select idea" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {linkableIdeas.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Note
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={editingNote?.note_type === 'journal_entry' ? 8 : 4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Link to Context</Label>
                <Select value={platformId} onValueChange={setPlatformId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.emoji} {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link to Idea</Label>
                <Select value={ideaId} onValueChange={setIdeaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select idea" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {linkableIdeas.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!title.trim()}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
