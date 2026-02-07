import { useState, useMemo } from 'react';
import { useIdea } from '@/contexts/IdeaContext';
import { Idea } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ViewIdeaDialog } from '@/components/ideas/ViewIdeaDialog';
import { EditIdeaDialog } from '@/components/ideas/EditIdeaDialog';
import { format, parseISO, isPast } from 'date-fns';
import { History, CalendarIcon, CheckCircle } from 'lucide-react';

export function PastIdeas() {
  const { ideas } = useIdea();
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);

  // Get past scheduled ideas (scheduled date is in the past)
  const pastIdeas = useMemo(() => 
    ideas
      .filter(idea => 
        idea.status === 'scheduled' && 
        idea.scheduled_date && 
        isPast(parseISO(idea.scheduled_date))
      )
      .sort((a, b) => 
        new Date(b.scheduled_date!).getTime() - new Date(a.scheduled_date!).getTime()
      ),
    [ideas]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Past Ideas</h1>
        <p className="text-muted-foreground mt-1">
          Ideas with past scheduled dates
        </p>
      </div>

      {pastIdeas.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No past ideas</h3>
            <p className="text-muted-foreground">
              Schedule some ideas and they'll appear here after their dates pass
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pastIdeas.map((idea) => (
            <Card
              key={idea.id}
              className="card-hover cursor-pointer"
              onClick={() => setViewingIdea(idea)}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{idea.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {format(parseISO(idea.scheduled_date!), 'MMMM d, yyyy')}
                    </span>
                    {idea.content_type && (
                      <Badge variant="secondary" className="text-xs">
                        {idea.content_type.name}
                      </Badge>
                    )}
                    {idea.platform && (
                      <span>{idea.platform.name}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
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
