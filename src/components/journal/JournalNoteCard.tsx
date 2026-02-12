import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemNote } from '@/hooks/useSystems';
import { Edit, Trash2, Link2, Smile, Frown, Meh, Heart, Sparkles, Pin, PinOff } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const MOOD_ICONS: Record<string, { icon: typeof Smile; color: string }> = {
  great: { icon: Sparkles, color: 'text-yellow-500' },
  good: { icon: Smile, color: 'text-green-500' },
  okay: { icon: Meh, color: 'text-blue-500' },
  low: { icon: Frown, color: 'text-orange-500' },
  grateful: { icon: Heart, color: 'text-pink-500' },
};

interface Platform {
  id: string;
  name: string;
}

interface Idea {
  id: string;
  title: string;
}

interface JournalNoteCardProps {
  note: SystemNote;
  platform?: Platform | null;
  idea?: Idea | null;
  onEdit: (note: SystemNote) => void;
  onDelete: (id: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onView?: (note: SystemNote) => void;
  compact?: boolean;
}

export function JournalNoteCard({
  note,
  platform,
  idea,
  onEdit,
  onDelete,
  onTogglePin,
  onView,
  compact = false,
}: JournalNoteCardProps) {
  const MoodIcon = note.mood && MOOD_ICONS[note.mood]?.icon;
  const moodColor = note.mood && MOOD_ICONS[note.mood]?.color;

  // Strip HTML for preview
  const contentPreview = note.content
    ? note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  if (compact) {
    return (
      <div className="group flex items-center gap-4 px-4 py-3 border-b border-border hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => onView?.(note)}>
        {note.is_pinned && (
          <Pin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
        )}
        {MoodIcon && (
          <MoodIcon className={cn('h-4 w-4 flex-shrink-0', moodColor)} />
        )}
        <span className="flex-1 font-sans font-bold text-base truncate text-gray-900">{note.title}</span>
        {platform && (
          <span className="text-xs text-muted-foreground hidden sm:inline">{platform.name}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {note.entry_date 
            ? format(new Date(note.entry_date), 'MMM d, yyyy')
            : format(new Date(note.updated_at), 'MMM d')
          }
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
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
      </div>
    );
  }

  return (
    <Card className={cn(
      "group w-full transition-all hover:shadow-md cursor-pointer",
      note.is_pinned && "ring-2 ring-primary/30"
    )} onClick={() => onView?.(note)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header row with date and mood */}
            <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
              {note.is_pinned && (
                <Pin className="h-4 w-4 text-primary" />
              )}
              <span>
                {note.entry_date 
                  ? format(new Date(note.entry_date), 'EEEE, MMMM d, yyyy')
                  : format(new Date(note.updated_at), 'MMMM d, yyyy')
                }
              </span>
              {MoodIcon && (
                <MoodIcon className={cn('h-4 w-4', moodColor)} />
              )}
            </div>

            {/* Title - bold sans-serif font */}
            <h3 className="font-sans font-bold text-lg leading-tight mb-3 text-gray-900">
              {note.title}
            </h3>

            {/* Content preview - 4 lines */}
            {contentPreview && (
              <p className="text-sm text-gray-600 line-clamp-4 leading-relaxed">
                {contentPreview}
              </p>
            )}

            {/* Tags */}
            {(platform || idea) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {platform && (
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
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
          </div>

          {/* Actions */}
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" onClick={(e) => e.stopPropagation()}>
            {onTogglePin && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onTogglePin(note.id, !note.is_pinned)}
              >
                {note.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(note)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
