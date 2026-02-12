import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSystems, SystemNote, SystemNoteType } from '@/hooks/useSystems';
import { useNoteColors } from '@/hooks/useNoteColors';
import { useIdea } from '@/contexts/IdeaContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, StickyNote, BookOpen, LayoutGrid, List, ArrowUpDown, Palette, Search, X, MessageCircle } from 'lucide-react';
import { JournalEntryDialog } from '@/components/journal/JournalEntryDialog';
import { FocusModeDialog } from '@/components/journal/FocusModeDialog';
import { JournalNoteCard } from '@/components/journal/JournalNoteCard';
import { QuickNoteDialog } from '@/components/journal/QuickNoteDialog';
import { QuickNoteCard } from '@/components/journal/QuickNoteCard';
import { LogFAB } from '@/components/journal/LogFAB';
import { QuickCaptureDialog } from '@/components/journal/QuickCaptureDialog';
import { ViewQuickNoteDialog } from '@/components/journal/ViewQuickNoteDialog';
import { ViewJournalEntryDialog } from '@/components/journal/ViewJournalEntryDialog';
import { ThoughtCard } from '@/components/journal/ThoughtCard';

type ViewMode = 'expanded' | 'compact';
type SortOption = 'date_desc' | 'date_asc' | 'alpha_asc' | 'alpha_desc' | 'color';
type ColorFilter = '__all__' | '__none__' | string;

export function SystemsView() {
  const { user } = useAuth();
  const { systems, loading, createSystem, updateSystem, deleteSystem } = useSystems(user?.id);
  const { colors: noteColors, createColor, updateColor, deleteColor } = useNoteColors(user?.id);
  const { platforms, ideas } = useIdea();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<SystemNote | null>(null);
  const [noteType, setNoteType] = useState<SystemNoteType>('quick_thought');
  const [focusModeOpen, setFocusModeOpen] = useState(false);
  const [focusModeTitle, setFocusModeTitle] = useState('');
  const [focusModeContent, setFocusModeContent] = useState('');
  const [quickNoteViewMode, setQuickNoteViewMode] = useState<ViewMode>('expanded');
  const [journalViewMode, setJournalViewMode] = useState<ViewMode>('expanded');
  const [quickNoteSortBy, setQuickNoteSortBy] = useState<SortOption>('date_desc');
  const [colorFilter, setColorFilter] = useState<ColorFilter>('__all__');
  const [searchQuery, setSearchQuery] = useState('');
  const [quickCaptureOpen, setQuickCaptureOpen] = useState(false);
  const [viewingNote, setViewingNote] = useState<SystemNote | null>(null);

  const quickThoughts = systems.filter((s) => s.note_type === 'quick_thought');
  const journalEntries = systems.filter((s) => s.note_type === 'journal_entry');
  const thoughts = systems.filter((s) => s.note_type === 'thought');

  // State for inline thought input
  const [newThought, setNewThought] = useState('');

  // Filter quick thoughts by color and search
  const filteredQuickThoughts = useMemo(() => {
    let filtered = quickThoughts;
    
    // Apply color filter
    if (colorFilter === '__none__') {
      filtered = filtered.filter(n => !n.color);
    } else if (colorFilter !== '__all__') {
      filtered = filtered.filter(n => n.color === colorFilter);
    }
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        (n.content && n.content.toLowerCase().includes(query))
      );
    }
    
    return filtered;
  }, [quickThoughts, colorFilter, searchQuery]);

  // Sort quick thoughts based on selected option (pinned always first)
  const sortedQuickThoughts = useMemo(() => {
    const sorted = [...filteredQuickThoughts];
    
    // First sort by the selected option
    switch (quickNoteSortBy) {
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
        sorted.sort((a, b) => {
          const colorA = a.color || '';
          const colorB = b.color || '';
          return colorA.localeCompare(colorB);
        });
        break;
    }
    
    // Then stable-sort pinned items to the top
    return sorted.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return 0;
    });
  }, [filteredQuickThoughts, quickNoteSortBy]);

  // Filter and sort journal entries (search + pinned first)
  const filteredJournalEntries = useMemo(() => {
    let filtered = journalEntries;
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) || 
        (n.content && n.content.toLowerCase().includes(query))
      );
    }
    
    // Sort by date descending, then pinned first
    return filtered.sort((a, b) => {
      // Pinned first
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      // Then by date
      return new Date(b.entry_date || b.created_at).getTime() - new Date(a.entry_date || a.created_at).getTime();
    });
  }, [journalEntries, searchQuery]);

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

  // Toggle pin handler
  const handleTogglePin = async (id: string, isPinned: boolean) => {
    await updateSystem(id, { is_pinned: isPinned });
  };

  // Quick capture save handler
  const handleQuickCaptureSave = async (data: { title: string; content: string; type: SystemNoteType }) => {
    await createSystem({
      title: data.title,
      content: data.type === 'thought' ? null : (data.content || null),
      note_type: data.type,
      platform_id: null,
      idea_id: null,
      entry_date: data.type === 'journal_entry' ? new Date().toISOString().split('T')[0] : null,
      mood: null,
      color: null,
    });
  };

  // Inline thought add handler
  const handleAddThought = async () => {
    if (!newThought.trim()) return;
    await createSystem({
      title: newThought.trim(),
      content: null,
      note_type: 'thought' as SystemNoteType,
      platform_id: null,
      idea_id: null,
    });
    setNewThought('');
  };

  // Filtered & sorted thoughts
  const filteredThoughts = useMemo(() => {
    let filtered = thoughts;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(n => n.title.toLowerCase().includes(query));
    }
    return filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [thoughts, searchQuery]);

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
        
        {/* Global Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
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

      {/* Tabs */}
      <Tabs defaultValue="thoughts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="thoughts" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Thoughts
          </TabsTrigger>
          <TabsTrigger value="quick" className="gap-2">
            <StickyNote className="h-4 w-4" />
            Quick Notes
          </TabsTrigger>
          <TabsTrigger value="journal" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Journal Entries
          </TabsTrigger>
        </TabsList>

        {/* Thoughts Tab */}
        <TabsContent value="thoughts" className="space-y-4">
          {/* Inline input */}
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

          {thoughts.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No thoughts yet. Jot down a quick one-liner!</p>
            </Card>
          ) : filteredThoughts.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No thoughts match your search.</p>
            </Card>
          ) : (
            <div className="space-y-1">
              {filteredThoughts.map((note) => (
                <ThoughtCard
                  key={note.id}
                  note={note}
                  onDelete={deleteSystem}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Quick Notes Tab */}
        <TabsContent value="quick" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <ToggleGroup
                type="single"
                value={quickNoteViewMode}
                onValueChange={(v) => v && setQuickNoteViewMode(v as ViewMode)}
                className="border rounded-md"
              >
                <ToggleGroupItem value="expanded" aria-label="Expanded view" className="gap-1.5 px-3">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">Cards</span>
                </ToggleGroupItem>
                <ToggleGroupItem value="compact" aria-label="Compact view" className="gap-1.5 px-3">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">List</span>
                </ToggleGroupItem>
              </ToggleGroup>
              
              {/* Sort dropdown */}
              <Select value={quickNoteSortBy} onValueChange={(v) => setQuickNoteSortBy(v as SortOption)}>
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

              {/* Color filter dropdown */}
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
            
            <Button onClick={() => openAdd('quick_thought')} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Note
            </Button>
          </div>

          {quickThoughts.length === 0 ? (
            <Card className="p-8 text-center">
              <StickyNote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No quick notes yet. Capture a fleeting idea!</p>
            </Card>
          ) : sortedQuickThoughts.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notes match your search.</p>
            </Card>
          ) : quickNoteViewMode === 'compact' ? (
            <div className="space-y-1">
              {sortedQuickThoughts.map((note) => (
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
                  onView={setViewingNote}
                />
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sortedQuickThoughts.map((note) => (
                <QuickNoteCard
                  key={note.id}
                  note={note}
                  platform={getLinkedPlatform(note.platform_id)}
                  idea={getLinkedIdea(note.idea_id)}
                  noteColors={noteColors}
                  onEdit={openEdit}
                  onDelete={deleteSystem}
                  onTogglePin={handleTogglePin}
                  onView={setViewingNote}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Journal Entries Tab */}
        <TabsContent value="journal" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <ToggleGroup
              type="single"
              value={journalViewMode}
              onValueChange={(v) => v && setJournalViewMode(v as ViewMode)}
              className="border rounded-md"
            >
              <ToggleGroupItem value="expanded" aria-label="Expanded view" className="gap-1.5 px-3">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Expanded</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="compact" aria-label="Compact view" className="gap-1.5 px-3">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Titles</span>
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleOpenFocusMode} className="gap-2">
                Focus Mode
              </Button>
              <Button onClick={() => openAdd('journal_entry')} className="gap-2">
                <Plus className="h-4 w-4" />
                New Entry
              </Button>
            </div>
          </div>

          {journalEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No journal entries yet. Start documenting your journey!</p>
            </Card>
          ) : filteredJournalEntries.length === 0 ? (
            <Card className="p-8 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No entries match your search.</p>
            </Card>
          ) : journalViewMode === 'compact' ? (
            <Card className="divide-y divide-border overflow-hidden">
              {filteredJournalEntries.map((note) => (
                <JournalNoteCard
                   key={note.id}
                   note={note}
                   compact
                   platform={getLinkedPlatform(note.platform_id)}
                   idea={getLinkedIdea(note.idea_id)}
                   onEdit={openEdit}
                   onDelete={deleteSystem}
                   onTogglePin={handleTogglePin}
                   onView={setViewingNote}
                 />
              ))}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredJournalEntries.map((note) => (
                <JournalNoteCard
                   key={note.id}
                   note={note}
                   platform={getLinkedPlatform(note.platform_id)}
                   idea={getLinkedIdea(note.idea_id)}
                   onEdit={openEdit}
                   onDelete={deleteSystem}
                   onTogglePin={handleTogglePin}
                   onView={setViewingNote}
                 />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
          noteColors={noteColors}
          onSave={handleQuickNoteSave}
          onCreateColor={createColor}
          onUpdateColor={updateColor}
          onDeleteColor={deleteColor}
        />
      )}

      {/* View Quick Note Dialog */}
      <ViewQuickNoteDialog
        note={viewingNote}
        open={!!viewingNote}
        onOpenChange={(open) => { if (!open) setViewingNote(null); }}
        platform={viewingNote ? getLinkedPlatform(viewingNote.platform_id) : null}
        idea={viewingNote ? getLinkedIdea(viewingNote.idea_id) : null}
        noteColors={noteColors}
      />

      <ViewJournalEntryDialog
        note={viewingNote && viewingNote.note_type === 'journal_entry' ? viewingNote : null}
        open={!!viewingNote && viewingNote.note_type === 'journal_entry'}
        onOpenChange={(open) => { if (!open) setViewingNote(null); }}
        platform={viewingNote ? getLinkedPlatform(viewingNote.platform_id) : null}
        idea={viewingNote ? getLinkedIdea(viewingNote.idea_id) : null}
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
