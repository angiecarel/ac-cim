import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { useIdea } from '@/contexts/IdeaContext';
import { Idea } from '@/types';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface ScheduleIdeaDialogProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScheduleIdeaDialog({ idea, open, onOpenChange }: ScheduleIdeaDialogProps) {
  const { updateIdea } = useIdea();
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    idea?.scheduled_date ? new Date(idea.scheduled_date) : new Date()
  );

  const handleSchedule = async () => {
    if (!idea || !selectedDate) return;

    setLoading(true);
    await updateIdea(idea.id, {
      status: 'scheduled',
      scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
    });
    setLoading(false);
    onOpenChange(false);
  };

  if (!idea) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-gradient">Schedule Idea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Scheduling: <span className="font-medium text-foreground">{idea.title}</span>
          </p>
          
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSchedule} 
              className="bg-gradient-creative hover:opacity-90" 
              disabled={loading || !selectedDate}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Schedule for {selectedDate ? format(selectedDate, 'MMM d') : '...'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
