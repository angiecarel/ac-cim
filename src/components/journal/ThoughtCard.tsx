import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SystemNote } from '@/hooks/useSystems';
import { Trash2, Pin, PinOff, ArrowUpRight, Check, X, StickyNote, BookOpen, Link, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Idea {
  id: string;
  title: string;
  status: string;
}

interface ThoughtCardProps {
  note: SystemNote;
  ideas?: Idea[];
  onDelete: (id: string) => void;
  onUpdate?: (id: string, updates: { title?: string; idea_id?: string | null }) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onSendToBucket?: (note: SystemNote) => void;
  onMoveTo?: (id: string, noteType: 'quick_thought' | 'journal_entry') => void;
  onCreateIdea?: (title: string) => Promise<{ id: string; title: string } | null>;
}

export function ThoughtCard({ note, ideas = [], onDelete, onUpdate, onTogglePin, onSendToBucket, onMoveTo, onCreateIdea }: ThoughtCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedIdeaId, setEditedIdeaId] = useState(note.idea_id || '');

  // Inline idea creation state
  const [showNewIdeaInput, setShowNewIdeaInput] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [creatingIdea, setCreatingIdea] = useState(false);
  const newIdeaInputRef = useRef<HTMLInputElement>(null);

  const linkableIdeas = ideas.filter((i) => !['archived', 'recycled'].includes(i.status));

  const handleSave = () => {
    if (editedTitle.trim()) {
      onUpdate?.(note.id, {
        title: editedTitle.trim() !== note.title ? editedTitle.trim() : undefined,
        idea_id: editedIdeaId || null,
      });
    }
    setIsEditing(false);
    setShowNewIdeaInput(false);
    setNewIdeaTitle('');
  };

  const handleCancel = () => {
    setEditedTitle(note.title);
    setEditedIdeaId(note.idea_id || '');
    setIsEditing(false);
    setShowNewIdeaInput(false);
    setNewIdeaTitle('');
  };

  const handleCreateNewIdea = async () => {
    if (!newIdeaTitle.trim() || !onCreateIdea) return;
    setCreatingIdea(true);
    const created = await onCreateIdea(newIdeaTitle.trim());
    setCreatingIdea(false);
    if (created) {
      setEditedIdeaId(created.id);
      setShowNewIdeaInput(false);
      setNewIdeaTitle('');
    }
  };

  if (isEditing) {
    return (
      <div className="flex flex-col gap-2 px-4 py-3 border-2 border-primary/30 bg-card rounded-md">
        <div className="flex items-center gap-2">
          <Input
            autoFocus
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !showNewIdeaInput) handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
            className="flex-1"
          />
          <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/10 shrink-0" onClick={handleSave}>
            <Check className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground shrink-0" onClick={handleCancel}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Idea link row */}
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <Link className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <Select
            value={editedIdeaId || '__none__'}
            onValueChange={(v) => {
              if (v === '__create__') {
                setShowNewIdeaInput(true);
                setTimeout(() => newIdeaInputRef.current?.focus(), 50);
              } else {
                setEditedIdeaId(v === '__none__' ? '' : v);
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue placeholder="Link to idea…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No idea linked</SelectItem>
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
        </div>

        {/* Inline new idea input */}
        {showNewIdeaInput && (
          <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            <Input
              ref={newIdeaInputRef}
              placeholder="New idea title…"
              value={newIdeaTitle}
              onChange={(e) => setNewIdeaTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateNewIdea();
                if (e.key === 'Escape') { setShowNewIdeaInput(false); setNewIdeaTitle(''); }
              }}
              className="h-7 text-xs"
            />
            <Button
              size="icon"
              className="h-7 w-7 shrink-0"
              onClick={handleCreateNewIdea}
              disabled={!newIdeaTitle.trim() || creatingIdea}
              title="Create idea"
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 shrink-0"
              onClick={() => { setShowNewIdeaInput(false); setNewIdeaTitle(''); }}
              title="Cancel"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  const linkedIdea = note.idea_id ? ideas.find((i) => i.id === note.idea_id) : null;

  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3 border-2 border-border bg-card transition-all hover:shadow-sm cursor-pointer',
        note.is_pinned && 'ring-2 ring-primary/30'
      )}
      onClick={() => setIsEditing(true)}
    >
      {note.is_pinned && (
        <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex-1 font-sans text-base text-foreground truncate">{note.title}</span>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <p>{note.title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {linkedIdea && (
        <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0 max-w-[140px] truncate">
          <Link className="h-3 w-3 shrink-0" />
          <span className="truncate">{linkedIdea.title}</span>
        </span>
      )}
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {format(new Date(note.created_at), 'MMM d')}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {onSendToBucket && (
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Send to Bucket" onClick={() => onSendToBucket(note)}>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        )}
        {onMoveTo && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Move to...">
                <StickyNote className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={() => onMoveTo(note.id, 'quick_thought')}>
                <StickyNote className="h-3.5 w-3.5 mr-2" />
                Quick Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onMoveTo(note.id, 'journal_entry')}>
                <BookOpen className="h-3.5 w-3.5 mr-2" />
                Journal Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {onTogglePin && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onTogglePin(note.id, !note.is_pinned)}>
            {note.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(note.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
