import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystems, SystemNote, SystemNoteType } from '@/hooks/useSystems';
import { useIdea } from '@/contexts/IdeaContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Plus, StickyNote, BookOpen, LayoutGrid, List } from 'lucide-react';
import { JournalEntryDialog } from '@/components/journal/JournalEntryDialog';
import { FocusModeDialog } from '@/components/journal/FocusModeDialog';
import { JournalNoteCard } from '@/components/journal/JournalNoteCard';
import { QuickNoteDialog } from '@/components/journal/QuickNoteDialog';
import { QuickNoteCard } from '@/components/journal/QuickNoteCard';

type ViewMode = 'expanded' | 'compact';

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
  const [quickNoteViewMode, setQuickNoteViewMode] = useState<ViewMode>('expanded');
  const [journalViewMode, setJournalViewMode] = useState<ViewMode>('expanded');

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

  // Journal entry save handler
  const handleJournalSave = async (data: {
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
        note_type: 'journal_entry',
        platform_id: data.platform_id,
        idea_id: data.idea_id,
        entry_date: data.entry_date,
        mood: data.mood,
      });
    }
    setEditingNote(null);
    setIsAddOpen(false);
  };

  // Quick note save handler
  const handleQuickNoteSave = async (data: {
    title: string;
    content: string;
    platform_id: string | null;
    idea_id: string | null;
    color: string | null;
  }) => {
    if (editingNote) {
      await updateSystem(editingNote.id, {
        title: data.title,
        content: data.content || null,
        platform_id: data.platform_id,
        idea_id: data.idea_id,
        color: data.color,
      });
    } else {
      await createSystem({
        title: data.title,
        content: data.content || null,
        note_type: 'quick_thought',
        platform_id: data.platform_id,
        idea_id: data.idea_id,
        color: data.color,
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
          <h1 className="text-3xl font-bold text-gradient">Log</h1>
          <p className="text-muted-foreground mt-1">Quick notes and journal entries</p>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quick Notes - Left Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Quick Notes</h2>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={quickNoteViewMode}
                onValueChange={(v) => v && setQuickNoteViewMode(v as ViewMode)}
                className="border rounded-md"
              >
                <ToggleGroupItem value="expanded" aria-label="Expanded view" className="gap-1.5 px-2">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact view" className="gap-1.5 px-2">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button onClick={() => openAdd('quick_thought')} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Note</span>
              </Button>
            </div>
          </div>

          {quickThoughts.length === 0 ? (
            <Card className="p-8 text-center">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quick notes yet. Capture a fleeting idea!</p>
            </Card>
          ) : quickNoteViewMode === 'compact' ? (
            <div className="space-y-1">
              {quickThoughts.map((note) => (
                <QuickNoteCard
                  key={note.id}
                  note={note}
                  compact
                  platform={getLinkedPlatform(note.platform_id)}
                  idea={getLinkedIdea(note.idea_id)}
                  onEdit={openEdit}
                  onDelete={deleteSystem}
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {quickThoughts.map((note) => (
                <QuickNoteCard
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
        </div>

        {/* Journal Entries - Right Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">Journal Entries</h2>
            </div>
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={journalViewMode}
                onValueChange={(v) => v && setJournalViewMode(v as ViewMode)}
                className="border rounded-md"
              >
                <ToggleGroupItem value="expanded" aria-label="Expanded view" className="gap-1.5 px-2">
                  <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact view" className="gap-1.5 px-2">
                  <List className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
              <Button variant="outline" onClick={handleOpenFocusMode} size="sm">
                Focus
              </Button>
              <Button onClick={() => openAdd('journal_entry')} size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">New Entry</span>
              </Button>
            </div>
          </div>

          {journalEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No journal entries yet. Start documenting your journey!</p>
            </Card>
          ) : journalViewMode === 'compact' ? (
            <Card className="divide-y divide-border overflow-hidden">
              {journalEntries.map((note) => (
                <JournalNoteCard
                  key={note.id}
                  note={note}
                  compact
                  platform={getLinkedPlatform(note.platform_id)}
                  idea={getLinkedIdea(note.idea_id)}
                  onEdit={openEdit}
                  onDelete={deleteSystem}
                />
              ))}
            </Card>
          ) : (
            <div className="space-y-4">
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
        </div>
      </div>

      {/* Journal Entry Dialog */}
      {noteType === 'journal_entry' && (
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
          onSave={handleJournalSave}
          onOpenFocusMode={handleOpenFocusMode}
        />
      )}

      {/* Quick Note Dialog */}
      {noteType === 'quick_thought' && (
        <QuickNoteDialog
          open={isAddOpen}
          onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) setEditingNote(null);
          }}
          editingNote={editingNote}
          platforms={platforms}
          ideas={ideas}
          onSave={handleQuickNoteSave}
        />
      )}

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
