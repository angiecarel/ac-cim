import { useEffect, useState } from 'react';
import { Idea, QuickLink, Tag } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  Pause, 
  Pencil, 
  CalendarIcon,
  MoreHorizontal,
  Archive,
  Recycle,
  Eye,
  Compass,
  Target,
  CalendarCheck
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
import { statusConfig, priorityLabels } from '@/lib/statusLabels';

interface IdeaListItemProps {
  idea: Idea;
  onView: (idea: Idea) => void;
  onEdit: (idea: Idea) => void;
  onSchedule: (idea: Idea) => void;
  compact?: boolean;
  quickLinks?: QuickLink[];
}

export function IdeaListItem({ idea, onView, onEdit, onSchedule, compact = false, quickLinks = [] }: IdeaListItemProps) {
  const { updateIdea, archiveIdea, recycleIdea, tags, getIdeaTags } = useIdea();
  const [ideaTags, setIdeaTags] = useState<Tag[]>([]);
  const statusInfo = statusConfig[idea.status];
  const StatusIcon = statusInfo.icon;

  useEffect(() => {
    getIdeaTags(idea.id).then(tagIds => {
      setIdeaTags(tags.filter(t => tagIds.includes(t.id)));
    });
  }, [idea.id, tags, getIdeaTags]);

  const relevantQuickLinks = quickLinks.filter(
    ql => !ql.content_type_id || ql.content_type_id === idea.content_type_id
  );

  const handleStatusChange = async (newStatus: 'hold' | 'developing' | 'ready') => {
    await updateIdea(idea.id, { status: newStatus, scheduled_date: null });
  };

  return (
    <div 
      className={cn(
        'flex items-center gap-4 p-4 border-b bg-card hover:bg-accent/5 cursor-pointer transition-colors group',
        idea.is_timely && 'timely-highlight'
      )}
      onClick={() => onView(idea)}
    >
      {/* Priority indicator */}
      <div className={cn(
        'w-1 h-8 rounded-full',
        idea.priority === 'none' && 'priority-indicator-none',
        idea.priority === 'good' && 'priority-indicator-good',
        idea.priority === 'better' && 'priority-indicator-better',
        idea.priority === 'best' && 'priority-indicator-best',
      )} />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <h3 className="font-medium truncate">{idea.title}</h3>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs"><p>{idea.title}</p></TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {idea.is_timely && (
            <Badge variant="destructive" className="h-5 animate-pulse-soft">
              <Clock className="h-3 w-3 mr-1" />
              Timely
            </Badge>
          )}
        </div>
        {!compact && idea.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {idea.description}
          </p>
        )}
      </div>

      {/* Metadata */}
      <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
        {idea.content_type && (
          <span className="bg-muted px-2 py-0.5 rounded text-xs">
            {idea.content_type.name}
          </span>
        )}
        {ideaTags.slice(0, 2).map(tag => (
          <span 
            key={tag.id} 
            className="px-2 py-0.5 rounded text-xs"
            style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
          >
            {tag.name}
          </span>
        ))}
        {idea.scheduled_date && (
          <span className="flex items-center gap-1 text-xs">
            <CalendarIcon className="h-3 w-3" />
            {format(new Date(idea.scheduled_date), 'MMM d')}
          </span>
        )}
      </div>

      {/* Status badge */}
      <Badge variant="secondary" className={cn('hidden sm:flex', statusInfo.className)}>
        <StatusIcon className="h-3 w-3 mr-1" />
        {statusInfo.label}
      </Badge>

      {/* QuickLinks */}
      {!compact && relevantQuickLinks.length > 0 && (
        <div className="hidden lg:flex items-center gap-2">
          {relevantQuickLinks.slice(0, 2).map((link) => (
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

      {/* Actions */}
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
            Captured
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('developing'); }}>
            <Compass className="h-4 w-4 mr-2" />
            Exploring
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleStatusChange('ready'); }}>
            <Target className="h-4 w-4 mr-2" />
            Actionable
          </DropdownMenuItem>
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSchedule(idea); }}>
            <CalendarCheck className="h-4 w-4 mr-2" />
            Plan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={(e) => { e.stopPropagation(); recycleIdea(idea.id); }}
            className="text-muted-foreground"
          >
            <Recycle className="h-4 w-4 mr-2" />
            Recycle
          </DropdownMenuItem>
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
  );
}
