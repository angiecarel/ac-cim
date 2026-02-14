import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemNote } from '@/hooks/useSystems';
import { NoteColor } from '@/hooks/useNoteColors';
import { Edit, Trash2, Link2, Pin, PinOff, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getColorStyle } from './QuickNoteDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  onSendToBucket?: (note: SystemNote) => void;
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
  onSendToBucket,
  compact = false,
}: QuickNoteCardProps) {
  const colorStyle = getColorStyle(note.color, noteColors);

  // Strip HTML for preview
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
          {onSendToBucket && (
            <Button variant="ghost" size="icon" className="h-6 w-6" title="Send to Bucket" onClick={() => onSendToBucket(note)}>
              <ArrowUpRight className="h-3 w-3" />
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
        "group relative transition-all hover:shadow-md cursor-pointer",
        note.is_pinned && "ring-2 ring-primary/30"
      )}
      style={{
        backgroundColor: colorStyle.bg,
        borderColor: colorStyle.border,
      }}
      onClick={() => onView?.(note)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-2">
          {note.is_pinned && (
            <Pin className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
          )}
          <CardTitle className="text-lg font-sans font-bold leading-snug pr-16 flex-1 text-gray-900">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="block truncate">{note.title}</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs"><p>{note.title}</p></TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </div>
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {onSendToBucket && (
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Send to Bucket" onClick={() => onSendToBucket(note)}>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {onTogglePin && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onTogglePin(note.id, !note.is_pinned)}
            >
              {note.is_pinned ? <PinOff className="h-3.5 w-3.5" /> : <Pin className="h-3.5 w-3.5" />}
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(note)}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {contentPreview && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {contentPreview}
          </p>
        )}

        {(platform || idea) && (
          <div className="flex flex-wrap gap-2">
            {platform && (
              <span className="inline-flex items-center gap-1 text-xs bg-background/50 px-2 py-1 rounded-full">
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

        <p className="text-xs text-gray-500">
          {format(new Date(note.updated_at), 'MMM d, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
}
