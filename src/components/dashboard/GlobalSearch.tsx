import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Lightbulb, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useIdea } from '@/contexts/IdeaContext';
import { useSystems } from '@/hooks/useSystems';
import { useAuth } from '@/contexts/AuthContext';
import { statusConfig } from '@/lib/statusLabels';
import { cn } from '@/lib/utils';

export function GlobalSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const { ideas, setFilters } = useIdea();
  const { user } = useAuth();
  const { systems: creativeSystems } = useSystems(user?.id, 'creative');
  const { systems: businessSystems } = useSystems(user?.id, 'business');
  const allSystems = [...creativeSystems, ...businessSystems];
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const searchLower = query.toLowerCase().trim();

  const matchedIdeas = searchLower
    ? ideas
        .filter(
          (i) =>
            i.title.toLowerCase().includes(searchLower) ||
            i.description?.toLowerCase().includes(searchLower)
        )
        .slice(0, 5)
    : [];

  const matchedNotes = searchLower
    ? allSystems
        .filter(
          (n) =>
            n.title.toLowerCase().includes(searchLower) ||
            n.content?.toLowerCase().includes(searchLower)
        )
        .slice(0, 5)
    : [];

  const hasResults = matchedIdeas.length > 0 || matchedNotes.length > 0;

  const handleIdeaClick = (ideaId: string) => {
    setFilters({ search: query });
    navigate('/ideas');
    setOpen(false);
    setQuery('');
  };

  const handleNoteClick = () => {
    navigate('/systems');
    setOpen(false);
    setQuery('');
  };

  const handleSearchAll = () => {
    setFilters({ search: query });
    navigate('/ideas');
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ideas, notes, and more..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(e.target.value.trim().length > 0);
          }}
          onFocus={() => {
            if (query.trim().length > 0) setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && searchLower) {
              handleSearchAll();
            }
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          className="pl-10 pr-10 h-11 bg-card border-border/60 focus-visible:ring-primary/30"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && searchLower && (
        <div className="absolute top-full mt-2 w-full z-50 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
          {!hasResults ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              No results found for "{query}"
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {matchedIdeas.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                    Ideas
                  </div>
                  {matchedIdeas.map((idea) => {
                    const status = statusConfig[idea.status];
                    return (
                      <button
                        key={idea.id}
                        onClick={() => handleIdeaClick(idea.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                      >
                        <Lightbulb className="h-4 w-4 text-primary flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate text-foreground">
                            {idea.title}
                          </p>
                          {idea.description && (
                            <p className="text-xs text-muted-foreground truncate">
                              {idea.description}
                            </p>
                          )}
                        </div>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full', status.className)}>
                          {status.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {matchedNotes.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/50">
                    Notes
                  </div>
                  {matchedNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={handleNoteClick}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors"
                    >
                      <FileText className="h-4 w-4 text-secondary-foreground flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate text-foreground">
                          {note.title}
                        </p>
                        {note.content && (
                          <p className="text-xs text-muted-foreground truncate">
                            {note.content.replace(/<[^>]*>/g, '').slice(0, 80)}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {note.note_type.replace('_', ' ')}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {searchLower && hasResults && (
                <button
                  onClick={handleSearchAll}
                  className="w-full px-3 py-2.5 text-sm text-primary hover:bg-accent transition-colors text-center border-t border-border"
                >
                  View all results for "{query}" →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
