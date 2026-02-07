import { Idea } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  Clock, 
  Pause, 
  Pencil, 
  Rocket, 
  CalendarIcon,
  MoreHorizontal,
  Archive,
  Eye
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { useIdea } from '@/contexts/IdeaContext';
import { QuickLink } from '@/types';

interface IdeaCardProps {
  idea: Idea;
  onView: (idea: Idea) => void;
  onEdit: (idea: Idea) => void;
  onSchedule: (idea: Idea) => void;
  quickLinks?: QuickLink[];
}

const statusConfig = {
  hold: { label: 'Hold', icon: Pause, className: 'status-badge-hold' },
  developing: { label: 'Developing', icon: Pencil, className: 'status-badge-developing' },
  ready: { label: 'Ready', icon: Rocket, className: 'status-badge-ready' },
  scheduled: { label: 'Scheduled', icon: CalendarIcon, className: 'status-badge-scheduled' },
  archived: { label: 'Archived', icon: Archive, className: 'status-badge-archived' },
  recycled: { label: 'Recycled', icon: Clock, className: 'status-badge-recycled' },
};

const priorityLabels = {
  none: '',
  good: 'Good',
  better: 'Better',
  best: 'Best',
};

export function IdeaCard({ idea, onView, onEdit, onSchedule, quickLinks = [] }: IdeaCardProps) {
  const { updateIdea, archiveIdea } = useIdea();
  const statusInfo = statusConfig[idea.status];
  const StatusIcon = statusInfo.icon;

  // Filter quicklinks by content type
  const relevantQuickLinks = quickLinks.filter(
    ql => !ql.content_type_id || ql.content_type_id === idea.content_type_id
  );

  const handleStatusChange = async (newStatus: 'hold' | 'developing' | 'ready') => {
    await updateIdea(idea.id, { status: newStatus, scheduled_date: null });
  };

  return (
    <Card 
      className={cn(
        'card-hover cursor-pointer group',
        idea.is_timely && 'timely-highlight'
      )}
      onClick={() => onView(idea)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground truncate">{idea.title}</h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <Badge variant="secondary" className={statusInfo.className}>
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>
              {idea.priority !== 'none' && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {priorityLabels[idea.priority]}
                </Badge>
              )}
              {idea.is_timely && (
                <Badge variant="destructive" className="animate-pulse-soft">
                  <Clock className="h-3 w-3 mr-1" />
                  Timely
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-popover">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(idea); }}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(idea); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('hold'); }}>
                <Pause className="h-4 w-4 mr-2" />
                Hold
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('developing'); }}>
                <Pencil className="h-4 w-4 mr-2" />
                Developing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('ready'); }}>
                <Rocket className="h-4 w-4 mr-2" />
                Ready
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSchedule(idea); }}>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Schedule
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); archiveIdea(idea.id); }}
                className="text-destructive focus:text-destructive"
              >
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        {idea.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 preserve-whitespace mb-3">
            {idea.description}
          </p>
        )}
        
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          {idea.content_type && (
            <span className="bg-muted px-2 py-0.5 rounded">
              {idea.content_type.name}
            </span>
          )}
          {idea.platform && (
            <span className="bg-muted px-2 py-0.5 rounded">
              {idea.platform.name}
            </span>
          )}
          {idea.scheduled_date && (
            <span className="flex items-center gap-1">
              <CalendarIcon className="h-3 w-3" />
              {format(new Date(idea.scheduled_date), 'MMM d, yyyy')}
            </span>
          )}
        </div>

        {/* QuickLinks */}
        {relevantQuickLinks.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
            {relevantQuickLinks.slice(0, 3).map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-primary hover:underline"
              >
                {link.name}
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
