import { useState } from 'react';
import { useIdea } from '@/contexts/IdeaContext';
import { Idea, IdeaStatus, IdeaPriority } from '@/types';
import { IdeaCard } from '@/components/ideas/IdeaCard';
import { IdeaListItem } from '@/components/ideas/IdeaListItem';
import { AddIdeaDialog } from '@/components/ideas/AddIdeaDialog';
import { ViewIdeaDialog } from '@/components/ideas/ViewIdeaDialog';
import { EditIdeaDialog } from '@/components/ideas/EditIdeaDialog';
import { ScheduleIdeaDialog } from '@/components/ideas/ScheduleIdeaDialog';
import { FloatingAddButton } from '@/components/ideas/FloatingAddButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  LayoutGrid, 
  List, 
  AlignJustify,
  Search,
  Filter,
  X,
  Clock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const statusOptions: { value: IdeaStatus; label: string }[] = [
  { value: 'hold', label: 'Hold' },
  { value: 'developing', label: 'Developing' },
  { value: 'ready', label: 'Ready' },
  { value: 'scheduled', label: 'Scheduled' },
];

const priorityOptions: { value: IdeaPriority; label: string }[] = [
  { value: 'none', label: 'No Priority' },
  { value: 'good', label: 'Good' },
  { value: 'better', label: 'Better' },
  { value: 'best', label: 'Best' },
];

export function IdeaBucket() {
  const {
    timelyIdeas,
    nonTimelyIdeas,
    ideasLoading,
    viewMode,
    setViewMode,
    filters,
    setFilters,
    clearFilters,
    contentTypes,
    platforms,
    quickLinks,
  } = useIdea();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [schedulingIdea, setSchedulingIdea] = useState<Idea | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ ...filters, search: value || undefined });
  };

  const toggleStatusFilter = (status: IdeaStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    setFilters({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
  };

  const togglePriorityFilter = (priority: IdeaPriority) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    setFilters({ ...filters, priority: newPriorities.length > 0 ? newPriorities : undefined });
  };

  const toggleContentTypeFilter = (id: string) => {
    const current = filters.contentType || [];
    const updated = current.includes(id)
      ? current.filter(c => c !== id)
      : [...current, id];
    setFilters({ ...filters, contentType: updated.length > 0 ? updated : undefined });
  };

  const togglePlatformFilter = (id: string) => {
    const current = filters.platform || [];
    const updated = current.includes(id)
      ? current.filter(p => p !== id)
      : [...current, id];
    setFilters({ ...filters, platform: updated.length > 0 ? updated : undefined });
  };

  const hasActiveFilters = !!(
    filters.status?.length ||
    filters.priority?.length ||
    filters.contentType?.length ||
    filters.platform?.length ||
    filters.search
  );

  const allIdeas = [...timelyIdeas, ...nonTimelyIdeas];

  const renderIdeas = (ideas: Idea[], isTimely = false) => {
    if (ideas.length === 0) return null;

    if (viewMode === 'grid') {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onView={setViewingIdea}
              onEdit={setEditingIdea}
              onSchedule={setSchedulingIdea}
              quickLinks={quickLinks}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="border rounded-lg overflow-hidden">
        {ideas.map((idea) => (
          <IdeaListItem
            key={idea.id}
            idea={idea}
            onView={setViewingIdea}
            onEdit={setEditingIdea}
            onSchedule={setSchedulingIdea}
            compact={viewMode === 'compact'}
            quickLinks={quickLinks}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Idea Bucket</h1>
          <p className="text-muted-foreground mt-1">
            {allIdeas.length} {allIdeas.length === 1 ? 'idea' : 'ideas'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            className={cn(viewMode === 'grid' && 'bg-background shadow-sm')}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(viewMode === 'compact' && 'bg-background shadow-sm')}
            onClick={() => setViewMode('compact')}
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(viewMode === 'list' && 'bg-background shadow-sm')}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filter popovers */}
        <div className="flex gap-2 flex-wrap">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
                {filters.status?.length ? (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {filters.status.length}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-popover" align="start">
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${option.value}`}
                      checked={filters.status?.includes(option.value)}
                      onCheckedChange={() => toggleStatusFilter(option.value)}
                    />
                    <Label htmlFor={`status-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Priority
                {filters.priority?.length ? (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {filters.priority.length}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-popover" align="start">
              <div className="space-y-2">
                {priorityOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${option.value}`}
                      checked={filters.priority?.includes(option.value)}
                      onCheckedChange={() => togglePriorityFilter(option.value)}
                    />
                    <Label htmlFor={`priority-${option.value}`} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Type
                {filters.contentType?.length ? (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {filters.contentType.length}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-popover" align="start">
              <div className="space-y-2">
                {contentTypes.map((ct) => (
                  <div key={ct.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${ct.id}`}
                      checked={filters.contentType?.includes(ct.id)}
                      onCheckedChange={() => toggleContentTypeFilter(ct.id)}
                    />
                    <Label htmlFor={`type-${ct.id}`} className="text-sm">
                      {ct.name}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                Platform
                {filters.platform?.length ? (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {filters.platform.length}
                  </Badge>
                ) : null}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 bg-popover" align="start">
              <div className="space-y-2">
                {platforms.map((p) => (
                  <div key={p.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`platform-${p.id}`}
                      checked={filters.platform?.includes(p.id)}
                      onCheckedChange={() => togglePlatformFilter(p.id)}
                    />
                    <Label htmlFor={`platform-${p.id}`} className="text-sm">
                      {p.name}
                    </Label>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.status?.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1">
              {s}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleStatusFilter(s)} />
            </Badge>
          ))}
          {filters.priority?.map((p) => (
            <Badge key={p} variant="secondary" className="gap-1">
              {p}
              <X className="h-3 w-3 cursor-pointer" onClick={() => togglePriorityFilter(p)} />
            </Badge>
          ))}
          {filters.contentType?.map((id) => {
            const ct = contentTypes.find(c => c.id === id);
            return ct ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {ct.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleContentTypeFilter(id)} />
              </Badge>
            ) : null;
          })}
          {filters.platform?.map((id) => {
            const p = platforms.find(pl => pl.id === id);
            return p ? (
              <Badge key={id} variant="secondary" className="gap-1">
                {p.name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => togglePlatformFilter(id)} />
              </Badge>
            ) : null;
          })}
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleSearch('')} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
            Clear all
          </Button>
        </div>
      )}

      {/* Loading state */}
      {ideasLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Ideas content */}
      {!ideasLoading && (
        <>
          {/* Timely section */}
          {timelyIdeas.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-destructive animate-pulse-soft" />
                <h2 className="font-semibold text-lg">Timely Ideas</h2>
                <Badge variant="destructive">{timelyIdeas.length}</Badge>
              </div>
              {renderIdeas(timelyIdeas, true)}
            </div>
          )}

          {/* Regular ideas */}
          {nonTimelyIdeas.length > 0 && (
            <div className="space-y-3">
              {timelyIdeas.length > 0 && (
                <h2 className="font-semibold text-lg">All Ideas</h2>
              )}
              {renderIdeas(nonTimelyIdeas)}
            </div>
          )}

          {/* Empty state */}
          {allIdeas.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {hasActiveFilters ? 'No matching ideas' : 'No ideas yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? 'Try adjusting your filters or search terms'
                  : 'Start capturing your creative ideas!'}
              </p>
              {hasActiveFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : (
                <Button className="bg-gradient-creative hover:opacity-90" onClick={() => setShowAddDialog(true)}>
                  Add Your First Idea
                </Button>
              )}
            </div>
          )}
        </>
      )}

      {/* Floating add button */}
      <FloatingAddButton onClick={() => setShowAddDialog(true)} />

      {/* Dialogs */}
      <AddIdeaDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
      <ViewIdeaDialog
        idea={viewingIdea}
        open={!!viewingIdea}
        onOpenChange={(open) => !open && setViewingIdea(null)}
        onEdit={(idea) => {
          setViewingIdea(null);
          setEditingIdea(idea);
        }}
      />
      <EditIdeaDialog
        idea={editingIdea}
        open={!!editingIdea}
        onOpenChange={(open) => !open && setEditingIdea(null)}
      />
      <ScheduleIdeaDialog
        idea={schedulingIdea}
        open={!!schedulingIdea}
        onOpenChange={(open) => !open && setSchedulingIdea(null)}
      />
    </div>
  );
}
