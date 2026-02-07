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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useIdea } from '@/contexts/IdeaContext';
import { Idea, IdeaPriority, IdeaStatus } from '@/types';
import { Loader2, CalendarIcon, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EditIdeaDialogProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditIdeaDialog({ idea, open, onOpenChange }: EditIdeaDialogProps) {
  const { updateIdea, deleteIdea, contentTypes, platforms } = useIdea();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<IdeaStatus | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [contentTypeId, setContentTypeId] = useState<string>('');
  const [platformId, setPlatformId] = useState<string>('');
  const [priority, setPriority] = useState<IdeaPriority>('none');
  const [status, setStatus] = useState<IdeaStatus>('developing');
  const [isTimely, setIsTimely] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();

  useEffect(() => {
    if (idea && open) {
      setTitle(idea.title);
      setDescription(idea.description || '');
      setContent(idea.content || '');
      setContentTypeId(idea.content_type_id || '');
      setPlatformId(idea.platform_id || '');
      setPriority(idea.priority);
      setStatus(idea.status);
      setIsTimely(idea.is_timely);
      setScheduledDate(idea.scheduled_date ? new Date(idea.scheduled_date) : undefined);
    }
  }, [idea, open]);

  const handleStatusChange = (newStatus: IdeaStatus) => {
    // If changing from scheduled to something else, confirm
    if (status === 'scheduled' && newStatus !== 'scheduled' && scheduledDate) {
      setPendingStatus(newStatus);
      setShowStatusConfirm(true);
    } else {
      setStatus(newStatus);
      if (newStatus === 'scheduled' && !scheduledDate) {
        setScheduledDate(new Date());
      } else if (newStatus !== 'scheduled') {
        setScheduledDate(undefined);
      }
    }
  };

  const confirmStatusChange = () => {
    if (pendingStatus) {
      setStatus(pendingStatus);
      setScheduledDate(undefined);
      setPendingStatus(null);
    }
    setShowStatusConfirm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea || !title.trim()) return;

    setLoading(true);
    await updateIdea(idea.id, {
      title: title.trim(),
      description: description.trim() || null,
      content: content.trim() || null,
      content_type_id: contentTypeId || null,
      platform_id: platformId || null,
      priority,
      status,
      is_timely: isTimely,
      scheduled_date: scheduledDate ? format(scheduledDate, 'yyyy-MM-dd') : null,
    });
    setLoading(false);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    if (!idea) return;
    setLoading(true);
    await deleteIdea(idea.id);
    setLoading(false);
    setShowDeleteConfirm(false);
    onOpenChange(false);
  };

  if (!idea) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient">Edit Idea</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-content">Notes</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                placeholder="Detailed notes, outlines, scripts..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentTypeId} onValueChange={setContentTypeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" className="bg-popover">
                    <SelectItem value="">None</SelectItem>
                    {contentTypes.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id}>
                        {ct.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platform</Label>
                <Select value={platformId} onValueChange={setPlatformId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" className="bg-popover">
                    <SelectItem value="">None</SelectItem>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as IdeaPriority)}>
                  <SelectTrigger>
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

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(v) => handleStatusChange(v as IdeaStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" className="bg-popover">
                    <SelectItem value="hold">Hold</SelectItem>
                    <SelectItem value="developing">Developing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                    <SelectItem value="recycled">Recycled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {status === 'scheduled' && (
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !scheduledDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-popover" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="edit-timely">Timely</Label>
                <p className="text-xs text-muted-foreground">Mark for same-day attention</p>
              </div>
              <Switch
                id="edit-timely"
                checked={isTimely}
                onCheckedChange={setIsTimely}
              />
            </div>

            <div className="flex justify-between gap-2 pt-4 border-t">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-creative hover:opacity-90" disabled={loading || !title.trim()}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Idea?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the idea.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status change confirmation */}
      <AlertDialog open={showStatusConfirm} onOpenChange={setShowStatusConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Scheduled Date?</AlertDialogTitle>
            <AlertDialogDescription>
              Changing the status will remove the scheduled date. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingStatus(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
