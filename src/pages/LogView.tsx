import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystems, SystemNote, SystemNoteType, LogCategory } from '@/hooks/useSystems';
import { useNoteColors } from '@/hooks/useNoteColors';
import { useIdea } from '@/contexts/IdeaContext';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X, Download, ArrowUpDown, Palette } from 'lucide-react';
import { downloadCsv, formatSystemForCsv } from '@/lib/exportCsv';
import { JournalEntryDialog } from '@/components/journal/JournalEntryDialog';
import { FocusModeDialog } from '@/components/journal/FocusModeDialog';
import { QuickNoteCard } from '@/components/journal/QuickNoteCard';
import { LogFAB } from '@/components/journal/LogFAB';
import { QuickCaptureDialog } from '@/components/journal/QuickCaptureDialog';
import { ViewQuickNoteDialog } from '@/components/journal/ViewQuickNoteDialog';

type SortOption = 'date_desc' | 'date_asc' | 'alpha_asc' | 'alpha_desc' | 'color';
type ColorFilter = '__all__' | '__none__' | string;

interface LogViewProps {
  logCategory: LogCategory;
  title: string;
  description: string;
}

export function LogView({ logCategory, title, description }: LogViewProps) {
  const { user } = useAuth();
  const { systems, loading, createSystem, updateSystem, deleteSystem } = useSystems(user?.id, logCategory);
  const { colors: noteColors, createColor, updateColor, deleteColor } = useNoteColors(user?.id);
  const { platforms, ideas, createIdea } = useIdea();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SystemNote | null>(null);
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusModeTitle, setFocusModeTitle] = useState('');
  const [focusModeContent, setFocusModeContent] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [colorFilter, setColorFilter] = useState<ColorFilter>('__all__');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<SystemNote | null>(null);
  const [newThought, setNewThought] = useState('');

  // Filter by color and search
  const filteredEntries = useMemo(() => {
    let filtered = systems;

    if (colorFilter === '__none__') {
      filtered = filtered.filter(n => !n.color);
    } else if (colorFilter !== '__all__') {
      filtered = filtered.filter(n => n.color === colorFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(query) ||
        (n.content && n.content.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [systems, colorFilter, searchQuery]);

  // Sort (pinned always first)
  const sortedEntries = useMemo(() => {
    const sorted = [...filteredEntries];

    switch (sortBy) {
      case 'date_desc':
        sorted.sort((a, b) =>
          new Date(b.entry_date || b.created_at).getTime() - new Date(a.entry_date || a.created_at).getTime()
        );
        break;
      case 'date_asc':
        sorted.sort((a, b) =>
          new Date(a.entry_date || a.created_at).getTime() - new Date(b.entry_date || b.created_at).getTime()
        );
        break;
      case 'alpha_asc':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'alpha_desc':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'color':
        sorted.sort((a, b) => (a.color || '').localeCompare(b.color || ''));
        break;
    }

    return sorted.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
  }, [filteredEntries, sortBy]);

  const getLinkedPlatform = (platformId: string | null) => {
    if (!platformId) return null;
    return platforms.find((p) => p.id === platformId) || null;
  };

  const getLinkedIdea = (ideaId: string | null) => {
    if (!ideaId) return null;
    return ideas.find((i) => i.id === ideaId) || null;
  };

  // Unified save handler
  const handleSave = async (data: {
    title: string;
    content: string;
    platform_id: string | null;
    idea_id: string | null;
    entry_date: string | null;
    mood: string | null;
    color: string | null;
  }) => {
    if (editingNote) {
      await updateSystem(editingNote.id, {
        title: data.title,
        content: data.content || null,
        platform_id: data.platform_id,
        idea_id: data.idea_id,
        entry_date: data.entry_date,
        mood: data.mood,
        color: data.color,
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
        color: data.color,
      });
    }
    setEditingNote(null);
    setIsAddOpen(false);
  };

  const handleTogglePin = async (id: string, isPinned: boolean) => {
    await updateSystem(id, { is_pinned: isPinned });
  };

  const handleQuickCaptureSave = async (data: { title: string; content: string; type: SystemNoteType }) => {
    await createSystem({
      title: data.title,
      content: data.content || null,
      note_type: 'journal_entry',
      platform_id: null,
      idea_id: null,
      entry_date: new Date().toISOString().split('T')[0],
      mood: null,
      color: null,
    });
  };

  const handleAddThought = async () => {
    if (!newThought.trim()) return;
    await createSystem({
      title: newThought.trim(),
      content: null,
      note_type: 'journal_entry',
      platform_id: null,
      idea_id: null,
      entry_date: new Date().toISOString().split('T')[0],
    });
    setNewThought('');
  };

  const handlePromoteToIdea = async (note: SystemNote) => {
    const idea = await createIdea({
      title: note.title,
      description: note.content ? note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : undefined,
      status: 'developing',
      priority: 'none',
      platform_id: note.platform_id || undefined,
      idea_category: logCategory,
    });
    if (idea) {
      await deleteSystem(note.id);
      toast({ title: 'Promoted to Idea', description: `"${note.title}" moved to Idea Bucket` });
    }
  };

  const openEdit = (note: SystemNote) => {
    setEditingNote(note);
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
          <h1 className="text-3xl font-bold text-gradient">{title}</h1>
          <p className="text-muted-foreground mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              const rows = systems.map(formatSystemForCsv);
              downloadCsv(rows, `log-export-${new Date().toISOString().split('T')[0]}.csv`);
            }}
            disabled={systems.length === 0}
          >
            <Download className="h-4 w-4" />
            Export
          </Button>

          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Inline quick capture */}
      <div className="flex gap-2">
        <Input
          placeholder="What's on your mind?"
          value={newThought}
          onChange={(e) => setNewThought(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddThought(); }}
          className="flex-1"
        />
        <Button onClick={handleAddThought} disabled={!newThought.trim()} className="gap-2">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger className="w-[140px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date_desc">Newest First</SelectItem>
              <SelectItem value="date_asc">Oldest First</SelectItem>
              <SelectItem value="alpha_asc">A → Z</SelectItem>
              <SelectItem value="alpha_desc">Z → A</SelectItem>
              <SelectItem value="color">By Color</SelectItem>
            </SelectContent>
          </Select>

          <Select value={colorFilter} onValueChange={(v) => setColorFilter(v as ColorFilter)}>
            <SelectTrigger className="w-[160px]">
              <Palette className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Colors</SelectItem>
              <SelectItem value="__none__">No Color</SelectItem>
              {noteColors.map((color) => (
                <SelectItem key={color.id} value={color.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full border border-border"
                      style={{ backgroundColor: color.hex_color }}
                    />
                    {color.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleOpenFocusMode} className="gap-2">
            Focus Mode
          </Button>
          <Button onClick={() => { setEditingNote(null); setIsAddOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Entries List (compact only) */}
      {systems.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No entries yet. Jot down a quick thought or create a journal entry!</p>
        </Card>
      ) : sortedEntries.length === 0 ? (
        <Card className="p-8 text-center">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No entries match your search.</p>
        </Card>
      ) : (
        <div className="space-y-1">
          {sortedEntries.map((note) => (
            <QuickNoteCard
              key={note.id}
              note={note}
              compact
              platform={getLinkedPlatform(note.platform_id)}
              idea={getLinkedIdea(note.idea_id)}
              noteColors={noteColors}
              onEdit={openEdit}
              onDelete={deleteSystem}
              onTogglePin={handleTogglePin}
              onPromoteToIdea={handlePromoteToIdea}
              onView={setViewingNote}
            />
          ))}
        </div>
      )}

      {/* Journal Entry Dialog (unified) */}
      <JournalEntryDialog
        open={isAddOpen}
        onOpenChange={(open) => {
          setIsAddOpen(open);
          if (!open) setEditingNote(null);
        }}
        noteType="journal_entry"
        editingNote={editingNote}
        platforms={platforms}
        ideas={ideas}
        noteColors={noteColors}
        onSave={handleSave}
        onOpenFocusMode={handleOpenFocusMode}
        onCreateIdea={async (title) => {
          const idea = await createIdea({ title, status: 'developing', priority: 'none' });
          return idea ? { id: idea.id, title: idea.title } : null;
        }}
      />

      {/* View Note Dialog */}
      <ViewQuickNoteDialog
        note={viewingNote}
        open={!!viewingNote}
        onOpenChange={(open) => { if (!open) setViewingNote(null); }}
        platform={viewingNote ? getLinkedPlatform(viewingNote.platform_id) : null}
        idea={viewingNote ? getLinkedIdea(viewingNote.idea_id) : null}
        noteColors={noteColors}
      />

      <FocusModeDialog
        open={focusModeOpen}
        onOpenChange={setFocusModeOpen}
        initialTitle={focusModeTitle}
        initialContent={focusModeContent}
        onSave={handleFocusModeSave}
      />

      {/* Quick Capture Dialog */}
      <QuickCaptureDialog
        open={quickCaptureOpen}
        onOpenChange={setQuickCaptureOpen}
        onSave={handleQuickCaptureSave}
      />

      {/* Floating Action Button */}
      <LogFAB onClick={() => setQuickCaptureOpen(true)} />
    </div>
  );
}
