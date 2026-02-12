import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { StickyNote, BookOpen, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type CaptureType = 'quick_thought' | 'journal_entry' | 'thought';

interface QuickCaptureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: { title: string; content: string; type: CaptureType }) => void;
}

export function QuickCaptureDialog({
  open,
  onOpenChange,
  onSave,
}: QuickCaptureDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<CaptureType>('quick_thought');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setType('thought');
      // Focus input after dialog opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title: title.trim(), content: content.trim(), type });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick Capture</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={type === 'thought' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setType('thought')}
            >
              <MessageCircle className="h-4 w-4" />
              Thought
            </Button>
            <Button
              type="button"
              variant={type === 'quick_thought' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setType('quick_thought')}
            >
              <StickyNote className="h-4 w-4" />
              Quick Note
            </Button>
            <Button
              type="button"
              variant={type === 'journal_entry' ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2"
              onClick={() => setType('journal_entry')}
            >
              <BookOpen className="h-4 w-4" />
              Journal
            </Button>
          </div>

          {/* Title */}
          <Input
            ref={inputRef}
            placeholder="What's on your mind?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="font-handwritten text-lg"
          />

          {/* Optional content (hidden for thoughts) */}
          {type !== 'thought' && (
            <Textarea
              placeholder="Add details (optional)"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="resize-none"
            />
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
