import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Idea, Tag } from '@/types';
import { Clock, Pencil, Sparkles, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { statusConfig } from '@/lib/statusLabels';
import { useIdea } from '@/contexts/IdeaContext';
import { SparkDialog } from './SparkDialog';

interface ViewIdeaDialogProps {
  idea: Idea | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (idea: Idea) => void;
  onDuplicate?: (idea: Idea) => void;
}

const priorityLabels = {
  none: 'No Priority',
  good: 'Good',
  better: 'Better',
  best: 'Best',
};

export function ViewIdeaDialog({ idea, open, onOpenChange, onEdit, onDuplicate }: ViewIdeaDialogProps) {
  const { tags, getIdeaTags } = useIdea();
  const [ideaTags, setIdeaTags] = useState<Tag[]>([]);
  const [sparkOpen, setSparkOpen] = useState(false);

  useEffect(() => {
    if (idea && open) {
      getIdeaTags(idea.id).then(tagIds => {
        setIdeaTags(tags.filter(t => tagIds.includes(t.id)));
      });
    }
  }, [idea, open, tags, getIdeaTags]);

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
            {ideaTags.length > 0 && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ideaTags.map(tag => (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color, color: tag.color }}
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
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

          {/* Energy Level & Time Estimate */}
          <div className="grid grid-cols-2 gap-4">
            {idea.energy_level && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Energy Level</h4>
                <p className="text-sm capitalize">{idea.energy_level}</p>
              </div>
            )}
            {idea.time_estimate && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Time Estimate</h4>
                <p className="text-sm capitalize">{idea.time_estimate === 'week_plus' ? 'Week+' : idea.time_estimate}</p>
              </div>
            )}
          </div>

           {/* Actions */}
          <div className="flex flex-wrap justify-between gap-2 pt-4 border-t">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setSparkOpen(true)}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Spark
              </Button>
              {onDuplicate && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    onDuplicate(idea);
                    onOpenChange(false);
                  }}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </Button>
              )}
            </div>
            <div className="flex gap-2">
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
        </div>

        {/* Spark Dialog */}
        <SparkDialog
          idea={idea}
          open={sparkOpen}
          onOpenChange={setSparkOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
