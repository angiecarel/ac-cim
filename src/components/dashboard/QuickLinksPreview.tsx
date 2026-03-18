import { Link } from 'react-router-dom';
import { useIdea } from '@/contexts/IdeaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, ArrowRight } from 'lucide-react';

export function QuickLinksPreview() {
  const { quickLinks, quickLinksLoading } = useIdea();

  // Show up to 6 links
  const previewLinks = quickLinks.slice(0, 6);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="h-5 w-5 text-primary" />
          Quick Links
        </CardTitle>
        <Link to="/quicklinks">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {quickLinksLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : previewLinks.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-2">No quick links yet</p>
            <Link to="/quicklinks">
              <Button variant="outline" size="sm">Manage Quick Links</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-1.5">
            {previewLinks.map((link) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm hover:bg-accent transition-colors group"
              >
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                <span className="truncate text-foreground">{link.name}</span>
                {link.link_type && (
                  <span className="ml-auto text-xs text-muted-foreground flex-shrink-0">
                    {link.link_type}
                  </span>
                )}
              </a>
            ))}
            {quickLinks.length > 6 && (
              <Link to="/quicklinks" className="block text-center pt-1">
                <span className="text-xs text-muted-foreground hover:text-foreground">
                  +{quickLinks.length - 6} more
                </span>
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
