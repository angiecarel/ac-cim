import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemNote } from '@/hooks/useSystems';
import { NoteColor } from '@/hooks/useNoteColors';
import { Edit, Trash2, Link2, Pin, PinOff, Sparkles, BookOpen, Smile, Meh, Frown, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getColorStyle } from './QuickNoteDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const MOOD_ICONS: Record<string, { icon: typeof Smile; label: string }> = {
  great: { icon: Sparkles, label: 'Great' },
  good: { icon: Smile, label: 'Good' },
  okay: { icon: Meh, label: 'Okay' },
  low: { icon: Frown, label: 'Low' },
  grateful: { icon: Heart, label: 'Grateful' },
};

interface Platform {
  id: string;
  name: string;
}

interface Idea {
  id: string;
  title: string;
}

interface QuickNoteCardProps {
  note: SystemNote;
  platform?: Platform | null;
  idea?: Idea | null;
  noteColors: NoteColor[];
  onEdit: (note: SystemNote) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onView?: (note: SystemNote) => void;
  onPromoteToIdea?: (note: SystemNote) => void;
  onMoveTo?: (id: string) => void;
  compact?: boolean;
}

export function QuickNoteCard({
  note,
  platform,
  idea,
  noteColors,
  onEdit,
  onDelete,
  onTogglePin,
  onView,
  onPromoteToIdea,
  onMoveTo,
  compact = false,
}: QuickNoteCardProps) {
  const colorStyle = getColorStyle(note.color, noteColors);

  const contentPreview = note.content
    ? note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  if (compact) {
    return (
      <div
        className="group flex items-center gap-3 px-3 py-2 rounded-md border transition-all hover:shadow-sm cursor-pointer"
        style={{
          backgroundColor: colorStyle.bg,
          borderColor: colorStyle.border,
        }}
        onClick={() => onView?.(note)}
      >
        {note.is_pinned && (
          <Pin className="h-3 w-3 text-primary flex-shrink-0" />
        )}
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: colorStyle.border }}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="flex-1 font-sans font-bold text-base truncate text-gray-900">{note.title}</span>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-xs"><p>{note.title}</p></TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {platform && (
          <span className="text-xs text-muted-foreground hidden sm:inline">{platform.name}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.updated_at), 'MMM d')}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {onPromoteToIdea && (
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Promote to Idea" onClick={() => onPromoteToIdea(note)}>
              <Sparkles className="h-3 w-3" />
            </Button>
          )}
          {onMoveTo && (
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Move to Journal" onClick={() => onMoveTo(note.id)}>
              <BookOpen className="h-3 w-3" />
            </Button>
          )}
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onTogglePin(note.id, !note.is_pinned)}
            >
              {note.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(note)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "group relative transition-all hover:shadow-md cursor-pointer overflow-hidden",
        note.is_pinned && "ring-2 ring-primary/30"
      )}
      style={{
        backgroundColor: colorStyle.bg,
        borderColor: colorStyle.border,
      }}
      onClick={() => onView?.(note)}
    >
      <CardContent className="p-4 flex flex-col h-[160px]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {note.is_pinned && (
              <Pin className="h-4 w-4 text-primary flex-shrink-0" />
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-sans font-bold text-base leading-tight text-foreground truncate">{note.title}</h3>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="start" className="max-w-xs"><p>{note.title}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {onPromoteToIdea && (
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Promote to Idea" onClick={() => onPromoteToIdea(note)}>
                <Sparkles className="h-3.5 w-3.5" />
              </Button>
            )}
            {onMoveTo && (
              <Button variant="ghost" size="icon" className="h-7 w-7" title="Move to Journal" onClick={() => onMoveTo(note.id)}>
                <BookOpen className="h-3.5 w-3.5" />
              </Button>
            )}
            {onTogglePin && (
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onTogglePin(note.id, !note.is_pinned)}>
                {note.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(note)}>
              <Edit className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(note.id)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
          {contentPreview || '\u00A0'}
        </p>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2">
          <div className="flex flex-wrap gap-1.5 min-w-0">
            {platform && (
              <span className="inline-flex items-center gap-1 text-xs bg-background/50 px-2 py-0.5 rounded-full truncate">
                {platform.name}
              </span>
            )}
            {idea && (
              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full truncate">
                <Link2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{idea.title}</span>
              </span>
            )}
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {format(new Date(note.updated_at), 'MMM d, yyyy')}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
