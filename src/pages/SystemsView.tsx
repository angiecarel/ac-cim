import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystems, SystemNote, SystemNoteType } from '@/hooks/useSystems';
import { useIdea } from '@/contexts/IdeaContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, StickyNote, BookOpen } from 'lucide-react';
import { JournalEntryDialog } from '@/components/journal/JournalEntryDialog';
import { FocusModeDialog } from '@/components/journal/FocusModeDialog';
import { JournalNoteCard } from '@/components/journal/JournalNoteCard';

export function SystemsView() {
  const { user } = useAuth();
  const { systems, loading, createSystem, updateSystem, deleteSystem } = useSystems(user?.id);
  const { platforms, ideas } = useIdea();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SystemNote | null>(null);
  const [noteType, setNoteType] = useState<SystemNoteType>('quick_thought');
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusModeTitle, setFocusModeTitle] = useState('');
  const [focusModeContent, setFocusModeContent] = useState('');

  const quickThoughts = systems.filter((s) => s.note_type === 'quick_thought');
  const journalEntries = systems.filter((s) => s.note_type === 'journal_entry');

  const getLinkedPlatform = (platformId: string | null) => {
    if (!platformId) return null;
    return platforms.find((p) => p.id === platformId) || null;
  };

  const getLinkedIdea = (ideaId: string | null) => {
    if (!ideaId) return null;
    return ideas.find((i) => i.id === ideaId) || null;
  };

  const handleSave = async (data: {
    title: string;
    content: string;
    platform_id: string | null;
    idea_id: string | null;
    entry_date: string | null;
    mood: string | null;
  }) => {
    if (editingNote) {
      await updateSystem(editingNote.id, {
        title: data.title,
        content: data.content || null,
        platform_id: data.platform_id,
        idea_id: data.idea_id,
        entry_date: data.entry_date,
        mood: data.mood,
      });
    } else {
      await createSystem({
        title: data.title,
        content: data.content || null,
        note_type: noteType,
        platform_id: data.platform_id,
        idea_id: data.idea_id,
        entry_date: data.entry_date,
        mood: data.mood,
      });
    }
    setEditingNote(null);
    setIsAddOpen(false);
  };

  const openAdd = (type: SystemNoteType) => {
    setEditingNote(null);
    setNoteType(type);
    setIsAddOpen(true);
  };

  const openEdit = (note: SystemNote) => {
    setEditingNote(note);
    setNoteType(note.note_type);
    setIsAddOpen(true);
  };

  const handleOpenFocusMode = () => {
    setFocusModeTitle('');
    setFocusModeContent('');
    setIsAddOpen(false);
    setFocusModeOpen(true);
  };

  const handleFocusModeSave = async (title: string, content: string) => {
    await createSystem({
      title,
      content: content || null,
      note_type: 'journal_entry',
      platform_id: null,
      idea_id: null,
      entry_date: new Date().toISOString().split('T')[0],
      mood: null,
    });
    setFocusModeOpen(false);
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
      <Tabs defaultValue="journal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="journal" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Journal Entries
          </TabsTrigger>
          <TabsTrigger value="quick" className="gap-2">
            <StickyNote className="h-4 w-4" />
            Quick Thoughts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleOpenFocusMode} className="gap-2">
              Focus Mode
            </Button>
            <Button onClick={() => openAdd('journal_entry')} className="gap-2">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          </div>
          {journalEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No journal entries yet. Start documenting your journey!</p>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {journalEntries.map((note) => (
                <JournalNoteCard
                  key={note.id}
                  note={note}
                  platform={getLinkedPlatform(note.platform_id)}
                  idea={getLinkedIdea(note.idea_id)}
                  onEdit={openEdit}
                  onDelete={deleteSystem}
                />
              ))}
            </div>
          )}
        </TabsContent>

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
                <JournalNoteCard
                  key={note.id}
                  note={note}
                  isSticky
                  platform={getLinkedPlatform(note.platform_id)}
                  idea={getLinkedIdea(note.idea_id)}
                  onEdit={openEdit}
                  onDelete={deleteSystem}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Dialog */}
      <JournalEntryDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setEditingNote(null);
        }}
        noteType={noteType}
        editingNote={editingNote}
        platforms={platforms}
        ideas={ideas}
        onSave={handleSave}
        onOpenFocusMode={noteType === 'journal_entry' ? handleOpenFocusMode : undefined}
      />

      {/* Focus Mode Dialog */}
      <FocusModeDialog
        open={focusModeOpen}
        onOpenChange={setFocusModeOpen}
        initialTitle={focusModeTitle}
        initialContent={focusModeContent}
        onSave={handleFocusModeSave}
      />
    </div>
  );
}
