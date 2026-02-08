import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Idea } from '@/types';
import { Clock, Pencil } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { statusConfig } from '@/lib/statusLabels';

interface ViewIdeaDialogProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (idea: Idea) => void;
}

const priorityLabels = {
  none: 'No Priority',
  good: 'Good',
  better: 'Better',
  best: 'Best',
};

export function ViewIdeaDialog({ idea, open, onOpenChange, onEdit }: ViewIdeaDialogProps) {
  if (!idea) return null;

  const statusInfo = statusConfig[idea.status];
  const StatusIcon = statusInfo.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <DialogTitle className={cn(
              'text-xl',
              idea.is_timely && 'text-destructive'
            )}>
              {idea.is_timely && <Clock className="inline h-5 w-5 mr-2" />}
              {idea.title}
            </DialogTitle>
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Status and Priority badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className={statusInfo.className}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
            <Badge variant="outline">
              {priorityLabels[idea.priority]}
            </Badge>
            {idea.is_timely && (
              <Badge variant="destructive">
                Timely
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            {idea.content_type && (
              <div>
                <span className="text-muted-foreground">Idea Type:</span>
                <span className="ml-2 font-medium">{idea.content_type.name}</span>
              </div>
            )}
            {idea.platform && (
              <div>
                <span className="text-muted-foreground">Context:</span>
                <span className="ml-2 font-medium">{idea.platform.name}</span>
              </div>
            )}
            {idea.scheduled_date && (
              <div>
                <span className="text-muted-foreground">Planned:</span>
                <span className="ml-2 font-medium">
                  {format(new Date(idea.scheduled_date), 'MMMM d, yyyy')}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Created:</span>
              <span className="ml-2 font-medium">
                {format(new Date(idea.created_at), 'MMM d, yyyy')}
              </span>
            </div>
          </div>

          {/* Description */}
          {idea.description && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
              <p className="text-sm preserve-whitespace">{idea.description}</p>
            </div>
          )}

          {/* Content */}
          {idea.content && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Notes</h4>
              <div className="prose prose-sm max-w-none preserve-whitespace bg-muted/50 rounded-lg p-3">
                {idea.content}
              </div>
            </div>
           )}

          {/* Source */}
          {idea.source && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Source</h4>
              <p className="text-sm">{idea.source}</p>
            </div>
          )}

          {/* Next Action */}
          {idea.next_action && (
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Next Action</h4>
              <p className="text-sm preserve-whitespace">{idea.next_action}</p>
            </div>
          )}

           {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button 
              className="bg-gradient-creative hover:opacity-90"
              onClick={() => {
                onOpenChange(false);
                onEdit(idea);
              }}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
