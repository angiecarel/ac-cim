import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RichTextEditor, getWordCount } from './RichTextEditor';
import { SystemNote, SystemNoteType } from '@/hooks/useSystems';
import { format } from 'date-fns';
import { CalendarIcon, Maximize2, BookOpen, StickyNote, Smile, Frown, Meh, Heart, Sparkles, Plus, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOOD_OPTIONS = [
  { value: 'great', label: 'Great', icon: Sparkles, color: 'text-yellow-500' },
  { value: 'good', label: 'Good', icon: Smile, color: 'text-green-500' },
  { value: 'okay', label: 'Okay', icon: Meh, color: 'text-blue-500' },
  { value: 'low', label: 'Low', icon: Frown, color: 'text-orange-500' },
  { value: 'grateful', label: 'Grateful', icon: Heart, color: 'text-pink-500' },
];

interface Platform {
  id: string;
  name: string;
}

interface Idea {
  id: string;
  title: string;
  status: string;
}

interface JournalEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteType: SystemNoteType;
  editingNote?: SystemNote | null;
  platforms: Platform[];
  ideas: Idea[];
  onSave: (data: {
    title: string;
    content: string;
    platform_id: string | null;
    idea_id: string | null;
    entry_date: string | null;
    mood: string | null;
  }) => void;
  onOpenFocusMode?: () => void;
  onCreateIdea?: (title: string) => Promise<{ id: string; title: string } | null>;
}

export function JournalEntryDialog({
  open,
  onOpenChange,
  noteType,
  editingNote,
  platforms,
  ideas,
  onSave,
  onOpenFocusMode,
  onCreateIdea,
}: JournalEntryDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [ideaId, setIdeaId] = useState('');
  const [entryDate, setEntryDate] = useState<Date>(new Date());
  const [mood, setMood] = useState('');

  // Inline idea creation state
  const [showNewIdeaInput, setShowNewIdeaInput] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [creatingIdea, setCreatingIdea] = useState(false);
  const newIdeaInputRef = useRef<HTMLInputElement>(null);

  const isJournal = noteType === 'journal_entry';
  const linkableIdeas = ideas.filter((i) => !['archived', 'recycled'].includes(i.status));
  const wordCount = getWordCount(content);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content || '');
      setPlatformId(editingNote.platform_id || '');
      setIdeaId(editingNote.idea_id || '');
      setEntryDate(editingNote.entry_date ? new Date(editingNote.entry_date) : new Date());
      setMood(editingNote.mood || '');
    } else {
      setTitle('');
      setContent('');
      setPlatformId('');
      setIdeaId('');
      setEntryDate(new Date());
      setMood('');
    }
    setShowNewIdeaInput(false);
    setNewIdeaTitle('');
  }, [editingNote, open]);

  const handleCreateNewIdea = async () => {
    if (!newIdeaTitle.trim() || !onCreateIdea) return;
    setCreatingIdea(true);
    const created = await onCreateIdea(newIdeaTitle.trim());
    setCreatingIdea(false);
    if (created) {
      setIdeaId(created.id);
      setShowNewIdeaInput(false);
      setNewIdeaTitle('');
    }
  };

  const handleCancelNewIdea = () => {
    setShowNewIdeaInput(false);
    setNewIdeaTitle('');
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim() || '',
      platform_id: platformId || null,
      idea_id: ideaId || null,
      entry_date: format(entryDate, 'yyyy-MM-dd'),
      mood: mood || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('max-w-2xl max-h-[90vh] overflow-y-auto', isJournal && 'max-w-3xl')}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              {isJournal ? (
                <>
                  <BookOpen className="h-5 w-5 text-primary" />
                  {editingNote ? 'Edit Journal Entry' : 'New Journal Entry'}
                </>
              ) : (
                <>
                  <StickyNote className="h-5 w-5 text-accent-foreground" />
                  {editingNote ? 'Edit Quick Thought' : 'New Quick Thought'}
                </>
              )}
            </DialogTitle>
            {isJournal && onOpenFocusMode && (
              <Button variant="ghost" size="sm" onClick={onOpenFocusMode} title="Focus Mode">
                <Maximize2 className="h-4 w-4 mr-1" />
                Focus
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Entry Date & Mood Row */}
          {isJournal && (
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <Label className="mb-1.5 block">Entry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(entryDate, 'EEEE, MMMM d, yyyy')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={entryDate}
                      onSelect={(date) => date && setEntryDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label className="mb-1.5 block">How are you feeling?</Label>
                <div className="flex gap-1">
                  {MOOD_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.value}
                        type="button"
                        variant={mood === option.value ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setMood(mood === option.value ? '' : option.value)}
                        title={option.label}
                        className={cn(
                          'h-9 w-9 p-0',
                          mood === option.value && option.color
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isJournal ? "Today's reflection..." : 'Quick thought...'}
              className="mt-1.5"
            />
          </div>

          {/* Content */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label>Content</Label>
              {isJournal && (
                <span className="text-xs text-muted-foreground">
                  {wordCount} {wordCount === 1 ? 'word' : 'words'}
                </span>
              )}
            </div>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder={isJournal ? 'What\'s on your mind today?' : 'Capture your thought...'}
              minimal={!isJournal}
              autoFocus={!editingNote}
            />
          </div>

          {/* Links Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Link to Context</Label>
              <Select value={platformId || '__none__'} onValueChange={(v) => setPlatformId(v === '__none__' ? '' : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Link to Idea</Label>
              <Select value={ideaId || '__none__'} onValueChange={(v) => {
                if (v === '__create__') {
                  setShowNewIdeaInput(true);
                  setTimeout(() => newIdeaInputRef.current?.focus(), 50);
                } else {
                  setIdeaId(v === '__none__' ? '' : v);
                }
              }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select idea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {linkableIdeas.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.title}
                    </SelectItem>
                  ))}
                  {onCreateIdea && (
                    <SelectItem value="__create__" className="text-primary font-medium">
                      <span className="flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Create new idea…
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Inline new idea input */}
              {showNewIdeaInput && (
                <div className="flex gap-1.5 mt-2">
                  <Input
                    ref={newIdeaInputRef}
                    placeholder="New idea title…"
                    value={newIdeaTitle}
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNewIdea();
                      if (e.key === 'Escape') handleCancelNewIdea();
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCreateNewIdea}
                    disabled={!newIdeaTitle.trim() || creatingIdea}
                    title="Create idea"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCancelNewIdea}
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {editingNote ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
