import { useState, useMemo } from 'react';
import { useIdea } from '@/contexts/IdeaContext';
import { Idea } from '@/types';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ViewIdeaDialog } from '@/components/ideas/ViewIdeaDialog';
import { EditIdeaDialog } from '@/components/ideas/EditIdeaDialog';
import { FloatingAddButton } from '@/components/ideas/FloatingAddButton';
import { AddIdeaDialog } from '@/components/ideas/AddIdeaDialog';
import { format, isSameDay, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

export function CalendarView() {
  const { ideas } = useIdea();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Get scheduled ideas
  const scheduledIdeas = useMemo(() => 
    ideas.filter(idea => idea.status === 'scheduled' && idea.scheduled_date),
    [ideas]
  );

  // Get ideas for selected date
  const selectedDateIdeas = useMemo(() => {
    if (!selectedDate) return [];
    return scheduledIdeas.filter(idea => 
      idea.scheduled_date && isSameDay(parseISO(idea.scheduled_date), selectedDate)
    );
  }, [scheduledIdeas, selectedDate]);

  // Get dates with scheduled ideas for calendar highlighting
  const datesWithIdeas = useMemo(() => 
    scheduledIdeas.map(idea => parseISO(idea.scheduled_date!)),
    [scheduledIdeas]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Calendar</h1>
        <p className="text-muted-foreground mt-1">View your scheduled ideas</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-6">
        {/* Calendar */}
        <Card>
          <CardContent className="pt-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md w-full"
              modifiers={{
                hasIdea: datesWithIdeas,
              }}
              modifiersClassNames={{
                hasIdea: 'bg-primary/10 text-primary font-bold',
              }}
            />
          </CardContent>
        </Card>

        {/* Selected date ideas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateIdeas.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No ideas scheduled for this date
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDateIdeas.map((idea) => (
                  <div
                    key={idea.id}
                    className="p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => setViewingIdea(idea)}
                  >
                    <h4 className="font-medium">{idea.title}</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {idea.content_type && (
                        <Badge variant="secondary" className="text-xs">
                          {idea.content_type.name}
                        </Badge>
                      )}
                      {idea.platform && (
                        <Badge variant="outline" className="text-xs">
                          {idea.platform.name}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
}
