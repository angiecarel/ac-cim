import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemNote } from '@/hooks/useSystems';
import { Edit, Trash2, Link2, Smile, Frown, Meh, Heart, Sparkles } from 'lucide-react';
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
  isSticky?: boolean;
  platform?: Platform | null;
  idea?: Idea | null;
  onEdit: (note: SystemNote) => void;
  onDelete: (id: string) => void;
}

export function JournalNoteCard({
  note,
  isSticky = false,
  platform,
  idea,
  onEdit,
  onDelete,
}: JournalNoteCardProps) {
  const MoodIcon = note.mood && MOOD_ICONS[note.mood]?.icon;
  const moodColor = note.mood && MOOD_ICONS[note.mood]?.color;

  // Strip HTML for preview
  const contentPreview = note.content
    ? note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  return (
    <Card
      className={cn(
        'group relative card-hover transition-all',
        isSticky && 'bg-accent/30 border-accent/50'
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {MoodIcon && (
              <MoodIcon className={cn('h-4 w-4 flex-shrink-0', moodColor)} />
            )}
            <CardTitle className="text-base font-medium leading-tight truncate">
              {note.title}
            </CardTitle>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
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
      </CardHeader>
      <CardContent className="space-y-3">
        {contentPreview && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {contentPreview}
          </p>
        )}

        {(platform || idea) && (
          <div className="flex flex-wrap gap-2">
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

        <p className="text-xs text-muted-foreground">
          {note.entry_date 
            ? format(new Date(note.entry_date), 'EEEE, MMM d, yyyy')
            : format(new Date(note.updated_at), 'MMM d, yyyy')
          }
        </p>
      </CardContent>
    </Card>
  );
}
