import { Link } from 'react-router-dom';
import { useIdea } from '@/contexts/IdeaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QuickLinksManager } from '@/components/dashboard/QuickLinksManager';
import { 
  Lightbulb, 
  Pause, 
  Pencil, 
  Rocket, 
  CalendarIcon, 
  Archive,
  Clock,
  Settings,
  ArrowRight,
  Recycle
} from 'lucide-react';

export function Dashboard() {
  const { stats, setFilters } = useIdea();

  const statCards = [
    { label: 'Total Ideas', value: stats.total, icon: Lightbulb, color: 'text-primary' },
    { label: 'Captured', value: stats.byStatus.hold, icon: Pause, color: 'text-status-hold', status: 'hold' as const },
    { label: 'Exploring', value: stats.byStatus.developing, icon: Pencil, color: 'text-status-developing', status: 'developing' as const },
    { label: 'Actionable', value: stats.byStatus.ready, icon: Rocket, color: 'text-status-ready', status: 'ready' as const },
    { label: 'Planned', value: stats.byStatus.scheduled, icon: CalendarIcon, color: 'text-status-scheduled', status: 'scheduled' as const },
    { label: 'Archived', value: stats.byStatus.archived, icon: Archive, color: 'text-status-archived', status: 'archived' as const },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Your creative command center</p>
        </div>
        <Link to="/settings">
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Manage Settings
          </Button>
        </Link>
      </div>

      {/* Timely Alert */}
      {stats.timely > 0 && (
        <Link to="/ideas">
          <Card className="bg-gradient-creative-subtle border-primary/20 card-hover">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <Clock className="h-5 w-5 text-destructive animate-pulse-soft" />
                </div>
                <div>
                  <p className="font-semibold">
                    {stats.timely} timely {stats.timely === 1 ? 'idea' : 'ideas'} need attention
                  </p>
                  <p className="text-sm text-muted-foreground">Click to view in Idea Bucket</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((stat) => (
          <Link 
            key={stat.label} 
            to="/ideas"
            onClick={() => stat.status && setFilters({ status: [stat.status] })}
          >
            <Card className="card-hover h-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <stat.icon className={`h-8 w-8 ${stat.color} mb-2`} />
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* QuickLinks Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <QuickLinksManager />

        {/* Recent Activity placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Recycle className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/ideas" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Lightbulb className="h-4 w-4 mr-2" />
                Browse All Ideas
              </Button>
            </Link>
            <Link to="/calendar" className="block">
              <Button variant="outline" className="w-full justify-start">
                <CalendarIcon className="h-4 w-4 mr-2" />
                View Calendar
              </Button>
            </Link>
            <Link to="/archive" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Archive className="h-4 w-4 mr-2" />
                View Archive
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
