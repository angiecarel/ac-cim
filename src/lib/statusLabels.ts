import { 
  Pause, 
  Pencil, 
  Rocket, 
  CalendarIcon,
  Archive,
  Clock,
  Compass,
  Target,
  CalendarCheck
} from 'lucide-react';
import { IdeaStatus, IdeaPriority } from '@/types';

// Centralized status configuration with new terminology
// hold → Captured, developing → Exploring, ready → Actionable, scheduled → Planned
export const statusConfig = {
  hold: { label: 'Captured', icon: Pause, className: 'status-badge-hold' },
  developing: { label: 'Exploring', icon: Compass, className: 'status-badge-developing' },
  ready: { label: 'Actionable', icon: Target, className: 'status-badge-ready' },
  scheduled: { label: 'Planned', icon: CalendarCheck, className: 'status-badge-scheduled' },
  archived: { label: 'Archived', icon: Archive, className: 'status-badge-archived' },
  recycled: { label: 'Recycled', icon: Clock, className: 'status-badge-recycled' },
} as const;

// Status options for filters and dropdowns
export const statusOptions: { value: IdeaStatus; label: string }[] = [
  { value: 'hold', label: 'Captured' },
  { value: 'developing', label: 'Exploring' },
  { value: 'ready', label: 'Actionable' },
  { value: 'scheduled', label: 'Planned' },
];

// Priority labels
export const priorityLabels: Record<IdeaPriority, string> = {
  none: '',
  good: 'Good',
  better: 'Better',
  best: 'Best',
};

// Priority options for filters
export const priorityOptions: { value: IdeaPriority; label: string }[] = [
  { value: 'none', label: 'No Priority' },
  { value: 'good', label: 'Good' },
  { value: 'better', label: 'Better' },
  { value: 'best', label: 'Best' },
];

// Get status display info
export function getStatusInfo(status: IdeaStatus) {
  return statusConfig[status];
}

// Get priority label
export function getPriorityLabel(priority: IdeaPriority): string {
  return priorityLabels[priority];
}
