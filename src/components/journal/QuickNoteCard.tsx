import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SystemNote } from '@/hooks/useSystems';
import { Edit, Trash2, Link2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { getColorClasses } from './QuickNoteDialog';

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
  onEdit: (note: SystemNote) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export function QuickNoteCard({
  note,
  platform,
  idea,
  onEdit,
  onDelete,
  compact = false,
}: QuickNoteCardProps) {
  const colorClasses = getColorClasses(note.color);

  // Strip HTML for preview
  const contentPreview = note.content
    ? note.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  if (compact) {
    return (
      <div
        className={cn(
          'group flex items-center gap-3 px-3 py-2 rounded-md border transition-all hover:shadow-sm',
          colorClasses.bg,
          colorClasses.border
        )}
      >
        <div
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            note.color === 'yellow' && 'bg-yellow-500',
            note.color === 'green' && 'bg-green-500',
            note.color === 'blue' && 'bg-blue-500',
            note.color === 'purple' && 'bg-purple-500',
            note.color === 'pink' && 'bg-pink-500',
            note.color === 'orange' && 'bg-orange-500',
            note.color === 'gray' && 'bg-gray-500',
            !note.color && 'bg-accent'
          )}
        />
        <span className="flex-1 font-handwritten text-sm truncate">{note.title}</span>
        {platform && (
          <span className="text-xs text-muted-foreground hidden sm:inline">{platform.name}</span>
        )}
        <span className="text-xs text-muted-foreground">
          {format(new Date(note.updated_at), 'MMM d')}
        </span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
        'group relative transition-all hover:shadow-md',
        colorClasses.bg,
        colorClasses.border
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-handwritten leading-snug line-clamp-2">
            {note.title}
          </CardTitle>
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

        <p className="text-xs text-muted-foreground">
          {format(new Date(note.updated_at), 'MMM d, yyyy')}
        </p>
      </CardContent>
    </Card>
  );
}
