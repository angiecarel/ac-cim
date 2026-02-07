import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useIdea } from '@/contexts/IdeaContext';
import { IdeaPriority } from '@/types';
import { Loader2 } from 'lucide-react';

interface AddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddIdeaDialog({ open, onOpenChange }: AddIdeaDialogProps) {
  const { createIdea, contentTypes, platforms } = useIdea();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentTypeId, setContentTypeId] = useState<string>('');
  const [platformId, setPlatformId] = useState<string>('');
  const [priority, setPriority] = useState<IdeaPriority>('none');
  const [isTimely, setIsTimely] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setContentTypeId('');
      setPlatformId('');
      setPriority('none');
      setIsTimely(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    await createIdea({
      title: title.trim(),
      description: description.trim() || null,
      content_type_id: contentTypeId || null,
      platform_id: platformId || null,
      priority,
      is_timely: isTimely,
    });
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient">Add New Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What's your idea?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contentType">Content Type</Label>
              <Select value={contentTypeId || "__none__"} onValueChange={(v) => setContentTypeId(v === "__none__" ? "" : v)}>
                <SelectTrigger id="contentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="bg-popover">
                  <SelectItem value="__none__">None</SelectItem>
                  {contentTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platformId || "__none__"} onValueChange={(v) => setPlatformId(v === "__none__" ? "" : v)}>
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="bg-popover">
                  <SelectItem value="__none__">None</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as IdeaPriority)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="bg-popover">
                <SelectItem value="none">No Priority</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="better">Better</SelectItem>
                <SelectItem value="best">Best</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="timely">Timely</Label>
              <p className="text-xs text-muted-foreground">Mark for same-day attention</p>
            </div>
            <Switch
              id="timely"
              checked={isTimely}
              onCheckedChange={setIsTimely}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-creative hover:opacity-90" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Idea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
