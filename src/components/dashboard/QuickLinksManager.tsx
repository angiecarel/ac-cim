import { useState, useMemo } from 'react';
import { useIdea } from '@/contexts/IdeaContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ExternalLink, Plus, Pencil, Trash2, Loader2, X, Search } from 'lucide-react';
import { QuickLink, QUICKLINK_TYPES } from '@/types';
import { cn } from '@/lib/utils';

const UNCATEGORIZED = '__uncategorized__';

export function QuickLinksManager() {
  const {
    quickLinks,
    createQuickLink,
    updateQuickLink,
    deleteQuickLink,
  } = useIdea();

  // Add form state
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<string>('');
  const [newCustomType, setNewCustomType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Edit/delete state
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null);
  const [editCustomType, setEditCustomType] = useState('');
  const [showEditCustomInput, setShowEditCustomInput] = useState(false);
  const [deletingQuickLink, setDeletingQuickLink] = useState<QuickLink | null>(null);
  const [qlLoading, setQLLoading] = useState(false);

  // Search & filter
  const [search, setSearch] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState<string | null>(null);

  const resolvedNewType = showCustomInput ? newCustomType : newLinkType;

  const handleAddQuickLink = async () => {
    if (!newName.trim() || !newUrl.trim()) return;
    setQLLoading(true);
    await createQuickLink(newName.trim(), newUrl.trim(), null, resolvedNewType || null);
    setNewName(''); setNewUrl(''); setNewLinkType(''); setNewCustomType('');
    setShowCustomInput(false); setShowAddForm(false);
    setQLLoading(false);
  };

  const handleUpdateQuickLink = async () => {
    if (!editingQuickLink) return;
    setQLLoading(true);
    const finalType = showEditCustomInput ? editCustomType : editingQuickLink.link_type;
    await updateQuickLink(editingQuickLink.id, editingQuickLink.name, editingQuickLink.url, editingQuickLink.content_type_id, finalType || null);
    setEditingQuickLink(null); setShowEditCustomInput(false); setEditCustomType('');
    setQLLoading(false);
  };

  const handleDeleteQuickLink = async () => {
    if (!deletingQuickLink) return;
    setQLLoading(true);
    await deleteQuickLink(deletingQuickLink.id);
    setDeletingQuickLink(null);
    setQLLoading(false);
  };

  const getLinkTypeSelectValue = (type: string | null) => {
    if (!type) return '__none__';
    if ((QUICKLINK_TYPES as readonly string[]).includes(type)) return type;
    return '__custom__';
  };

  // All unique types present in current links
  const allTypes = useMemo(() => {
    const types = new Set<string>();
    quickLinks.forEach(l => { if (l.link_type) types.add(l.link_type); });
    return Array.from(types).sort();
  }, [quickLinks]);

  // Filtered links
  const filtered = useMemo(() => {
    return quickLinks.filter(l => {
      const matchesSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.url.toLowerCase().includes(search.toLowerCase());
      const matchesType = !activeTypeFilter
        ? true
        : activeTypeFilter === UNCATEGORIZED
          ? !l.link_type
          : l.link_type === activeTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [quickLinks, search, activeTypeFilter]);

  // Group filtered links by type
  const grouped = useMemo(() => {
    const groups: Record<string, QuickLink[]> = {};
    filtered.forEach(link => {
      const key = link.link_type || UNCATEGORIZED;
      if (!groups[key]) groups[key] = [];
      groups[key].push(link);
    });
    return groups;
  }, [filtered]);

  const groupKeys = Object.keys(grouped).sort((a, b) => {
    if (a === UNCATEGORIZED) return 1;
    if (b === UNCATEGORIZED) return -1;
    return a.localeCompare(b);
  });

  const hasUncategorized = quickLinks.some(l => !l.link_type);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search links..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          {/* Type filter chips */}
          <div className="flex gap-1 flex-wrap">
            {allTypes.map(type => (
              <Badge
                key={type}
                variant={activeTypeFilter === type ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => setActiveTypeFilter(activeTypeFilter === type ? null : type)}
              >
                {type}
              </Badge>
            ))}
            {hasUncategorized && (
              <Badge
                variant={activeTypeFilter === UNCATEGORIZED ? 'default' : 'outline'}
                className="cursor-pointer select-none"
                onClick={() => setActiveTypeFilter(activeTypeFilter === UNCATEGORIZED ? null : UNCATEGORIZED)}
              >
                Other
              </Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="p-4 border border-border bg-muted/30 space-y-3 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Name</Label>
              <Input placeholder="e.g. ChatGPT" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>URL</Label>
              <Input placeholder="https://..." value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1 max-w-xs">
            <Label>Type</Label>
            {showCustomInput ? (
              <div className="flex gap-2">
                <Input placeholder="Custom type..." value={newCustomType} onChange={(e) => setNewCustomType(e.target.value)} autoFocus />
                <Button variant="ghost" size="icon" onClick={() => { setShowCustomInput(false); setNewCustomType(''); }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Select value={newLinkType || '__none__'} onValueChange={(v) => {
                if (v === '__custom__') { setShowCustomInput(true); setNewLinkType(''); }
                else setNewLinkType(v === '__none__' ? '' : v);
              }}>
                <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="__none__">No type</SelectItem>
                  {QUICKLINK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  <SelectItem value="__custom__">+ Add custom...</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAddQuickLink} disabled={qlLoading || !newName.trim() || !newUrl.trim()} size="sm">
              {qlLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Save
            </Button>
            <Button variant="ghost" size="sm" onClick={() => {
              setShowAddForm(false); setNewName(''); setNewUrl('');
              setNewLinkType(''); setNewCustomType(''); setShowCustomInput(false);
            }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {quickLinks.length === 0 && (
        <div className="text-center py-12 border border-dashed border-border">
          <ExternalLink className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No quicklinks yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Add" to create your first quicklink</p>
        </div>
      )}

      {/* No results from filter/search */}
      {quickLinks.length > 0 && filtered.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No links match your search or filter.
        </div>
      )}

      {/* Grouped blocks */}
      <div className="space-y-6">
        {groupKeys.map(groupKey => {
          const groupLabel = groupKey === UNCATEGORIZED ? 'Other' : groupKey;
          const links = grouped[groupKey];
          return (
            <div key={groupKey} className="border border-border">
              {/* Block header = type name */}
              <div className="px-4 py-2 border-b border-border bg-muted/40">
                <span className="font-semibold text-sm uppercase tracking-wide">{groupLabel}</span>
                <span className="ml-2 text-xs text-muted-foreground">{links.length}</span>
              </div>
              <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {links.map(link => (
                  <div
                    key={link.id}
                    className="group relative flex items-center gap-2 p-3 border border-border/60 bg-background hover:bg-muted/50 transition-colors"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 flex-1 min-w-0 text-sm font-medium"
                    >
                      <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="truncate">{link.name}</span>
                    </a>
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => {
                              setEditingQuickLink({ ...link });
                              const isCustom = link.link_type && !(QUICKLINK_TYPES as readonly string[]).includes(link.link_type);
                              setShowEditCustomInput(!!isCustom);
                              setEditCustomType(isCustom ? link.link_type! : '');
                            }}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader><DialogTitle>Edit Link</DialogTitle></DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <Label>Name</Label>
                              <Input
                                value={editingQuickLink?.name || ''}
                                onChange={(e) => setEditingQuickLink(prev => prev ? { ...prev, name: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>URL</Label>
                              <Input
                                value={editingQuickLink?.url || ''}
                                onChange={(e) => setEditingQuickLink(prev => prev ? { ...prev, url: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Type</Label>
                              {showEditCustomInput ? (
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Custom type..."
                                    value={editCustomType}
                                    onChange={(e) => setEditCustomType(e.target.value)}
                                    autoFocus
                                  />
                                  <Button variant="ghost" size="icon" onClick={() => {
                                    setShowEditCustomInput(false); setEditCustomType('');
                                    setEditingQuickLink(prev => prev ? { ...prev, link_type: null } : null);
                                  }}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Select
                                  value={getLinkTypeSelectValue(editingQuickLink?.link_type ?? null)}
                                  onValueChange={(v) => {
                                    if (v === '__custom__') { setShowEditCustomInput(true); }
                                    else {
                                      const val = v === '__none__' ? null : v;
                                      setEditingQuickLink(prev => prev ? { ...prev, link_type: val } : null);
                                    }
                                  }}
                                >
                                  <SelectTrigger><SelectValue placeholder="Select type..." /></SelectTrigger>
                                  <SelectContent className="bg-popover z-50">
                                    <SelectItem value="__none__">No type</SelectItem>
                                    {QUICKLINK_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                    <SelectItem value="__custom__">+ Add custom...</SelectItem>
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <Button onClick={handleUpdateQuickLink} disabled={qlLoading} className="w-full">
                              {qlLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                              Save Changes
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={() => setDeletingQuickLink(link)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingQuickLink} onOpenChange={(open) => !open && setDeletingQuickLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Link</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingQuickLink?.name}"? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteQuickLink} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
