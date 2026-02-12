import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SystemNote } from '@/hooks/useSystems';
import { Trash2, Pin, PinOff, ArrowUpRight, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ThoughtCardProps {
  note: SystemNote;
  onDelete: (id: string) => void;
  onUpdate?: (id: string, title: string) => void;
  onTogglePin?: (id: string, isPinned: boolean) => void;
  onSendToBucket?: (note: SystemNote) => void;
}

export function ThoughtCard({ note, onDelete, onUpdate, onTogglePin, onSendToBucket }: ThoughtCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);

  const handleSave = () => {
    if (editedTitle.trim() && editedTitle !== note.title) {
      onUpdate?.(note.id, editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(note.title);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 border-2 border-primary/30 bg-card rounded-md">
        <Input
          autoFocus
          value={editedTitle}
          onChange={(e) => setEditedTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
            if (e.key === 'Escape') handleCancel();
          }}
          className="flex-1"
        />
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-primary hover:bg-primary/10"
          onClick={handleSave}
        >
          <Check className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground"
          onClick={handleCancel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

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
      <span className="flex-1 font-sans text-base text-foreground">{note.title}</span>
      <span className="text-xs text-muted-foreground flex-shrink-0">
        {format(new Date(note.created_at), 'MMM d')}
      </span>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {onSendToBucket && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            title="Send to Bucket"
            onClick={() => onSendToBucket(note)}
          >
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
