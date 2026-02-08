import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { SystemNote } from '@/hooks/useSystems';
import { StickyNote, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const QUICK_NOTE_COLORS = [
  { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-100 dark:bg-yellow-900/30', border: 'border-yellow-300 dark:border-yellow-700' },
  { value: 'green', label: 'Green', bg: 'bg-green-100 dark:bg-green-900/30', border: 'border-green-300 dark:border-green-700' },
  { value: 'blue', label: 'Blue', bg: 'bg-blue-100 dark:bg-blue-900/30', border: 'border-blue-300 dark:border-blue-700' },
  { value: 'purple', label: 'Purple', bg: 'bg-purple-100 dark:bg-purple-900/30', border: 'border-purple-300 dark:border-purple-700' },
  { value: 'pink', label: 'Pink', bg: 'bg-pink-100 dark:bg-pink-900/30', border: 'border-pink-300 dark:border-pink-700' },
  { value: 'orange', label: 'Orange', bg: 'bg-orange-100 dark:bg-orange-900/30', border: 'border-orange-300 dark:border-orange-700' },
  { value: 'gray', label: 'Gray', bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600' },
];

export function getColorClasses(color: string | null) {
  const found = QUICK_NOTE_COLORS.find(c => c.value === color);
  return found || { bg: 'bg-accent/30', border: 'border-accent/50' };
}

interface Platform {
  id: string;
  name: string;
}

interface Idea {
  id: string;
  title: string;
  status: string;
}

interface QuickNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: SystemNote | null;
  platforms: Platform[];
  ideas: Idea[];
  onSave: (data: {
    title: string;
    content: string;
    platform_id: string | null;
    idea_id: string | null;
    color: string | null;
  }) => void;
}

export function QuickNoteDialog({
  open,
  onOpenChange,
  editingNote,
  platforms,
  ideas,
  onSave,
}: QuickNoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [ideaId, setIdeaId] = useState('');
  const [color, setColor] = useState('yellow');

  const linkableIdeas = ideas.filter((i) => !['archived', 'recycled'].includes(i.status));

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content || '');
      setPlatformId(editingNote.platform_id || '');
      setIdeaId(editingNote.idea_id || '');
      setColor(editingNote.color || 'yellow');
    } else {
      setTitle('');
      setContent('');
      setPlatformId('');
      setIdeaId('');
      setColor('yellow');
    }
  }, [editingNote, open]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim() || '',
      platform_id: platformId || null,
      idea_id: ideaId || null,
      color: color || null,
    });
    onOpenChange(false);
  };

  const colorClasses = getColorClasses(color);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            {editingNote ? 'Edit Quick Note' : 'New Quick Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Color Selection */}
          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap">
              {QUICK_NOTE_COLORS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColor(option.value)}
                  className={cn(
                    'h-8 w-8 rounded-md border-2 transition-all',
                    option.bg,
                    color === option.value
                      ? 'ring-2 ring-primary ring-offset-2'
                      : option.border
                  )}
                  title={option.label}
                >
                  {color === option.value && (
                    <Check className="h-4 w-4 mx-auto text-foreground" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick thought..."
              className="mt-1.5"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Note</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Capture your thought..."
              rows={3}
              className="mt-1.5"
            />
          </div>

          {/* Links Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Link to Context</Label>
              <Select value={platformId || '__none__'} onValueChange={(v) => setPlatformId(v === '__none__' ? '' : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Link to Idea</Label>
              <Select value={ideaId || '__none__'} onValueChange={(v) => setIdeaId(v === '__none__' ? '' : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select idea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {linkableIdeas.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview */}
          <div className={cn('p-3 rounded-md border', colorClasses.bg, colorClasses.border)}>
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <p className="font-medium text-sm">{title || 'Your title here...'}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {editingNote ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
