import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor, getWordCount } from './RichTextEditor';
import { X, Save, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FocusModeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialTitle?: string;
  initialContent?: string;
  entryDate?: Date;
  onSave: (title: string, content: string) => void;
}

export function FocusModeDialog({
  open,
  onOpenChange,
  initialTitle = '',
  initialContent = '',
  entryDate = new Date(),
  onSave,
}: FocusModeDialogProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [startTime] = useState(new Date());
  const [elapsedTime, setElapsedTime] = useState(0);

  const wordCount = getWordCount(content);

  useEffect(() => {
    setTitle(initialTitle);
    setContent(initialContent);
  }, [initialTitle, initialContent, open]);

  // Timer for writing session
  useEffect(() => {
    if (!open) return;
    
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [open, startTime]);

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = () => {
    onSave(title, content);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-none w-screen h-screen m-0 p-0 rounded-none border-none bg-background">
        <div className="flex flex-col h-full">
          {/* Minimal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{format(entryDate, 'EEEE, MMMM d')}</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {formatElapsed(elapsedTime)}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{wordCount} words</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSave}
                disabled={!title.trim()}
                className="gap-1"
              >
                <Save className="h-4 w-4" />
                Save & Exit
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-8 w-8"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Writing Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-6 py-8">
              {/* Title */}
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Entry title..."
                className={cn(
                  'border-none shadow-none text-3xl font-serif font-medium px-0',
                  'focus-visible:ring-0 focus-visible:ring-offset-0',
                  'placeholder:text-muted-foreground/50'
                )}
              />

              {/* Content */}
              <div className="mt-6">
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Begin writing..."
                  className="border-none shadow-none"
                  editorClassName="min-h-[60vh] text-lg leading-relaxed"
                  autoFocus
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
