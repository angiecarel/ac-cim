import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SystemNote } from '@/hooks/useSystems';
import { Link2, Pin } from 'lucide-react';
import { format } from 'date-fns';

interface Platform {
  id: string;
  name: string;
}

interface Idea {
  id: string;
  title: string;
}

interface ViewJournalEntryDialogProps {
  note: SystemNote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: Platform | null;
  idea?: Idea | null;
}

const MOOD_ICONS: Record<string, string> = {
  great: '✨',
  good: '😊',
  okay: '😐',
  low: '😞',
  grateful: '❤️',
};

export function ViewJournalEntryDialog({
  note,
  open,
  onOpenChange,
  platform,
  idea,
}: ViewJournalEntryDialogProps) {
  if (!note) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {note.is_pinned && <Pin className="h-4 w-4 text-primary flex-shrink-0" />}
            <DialogTitle className="font-sans font-bold text-xl text-foreground">
              {note.title}
            </DialogTitle>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground pt-1">
            <span>
              {note.entry_date
                ? format(new Date(note.entry_date), 'EEEE, MMMM d, yyyy')
                : format(new Date(note.updated_at), 'MMMM d, yyyy')
              }
            </span>
            {note.mood && (
              <span className="flex items-center gap-1">
                {MOOD_ICONS[note.mood]} {note.mood.charAt(0).toUpperCase() + note.mood.slice(1)}
              </span>
            )}
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
        </DialogHeader>
        <ScrollArea className="flex-1 min-h-0">
          {note.content ? (
            <div
              className="prose prose-sm max-w-none text-foreground dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: note.content }}
            />
          ) : (
            <p className="text-muted-foreground italic">No content</p>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
