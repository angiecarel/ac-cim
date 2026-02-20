import { useState } from 'react';
import { useIdea } from '@/contexts/IdeaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { ExternalLink, Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import { QuickLink, QUICKLINK_TYPES } from '@/types';

export function QuickLinksManager() {
  const {
    quickLinks,
    createQuickLink,
    updateQuickLink,
    deleteQuickLink,
  } = useIdea();

  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState<string>('');
  const [newCustomType, setNewCustomType] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null);
  const [editCustomType, setEditCustomType] = useState('');
  const [showEditCustomInput, setShowEditCustomInput] = useState(false);

  const [deletingQuickLink, setDeletingQuickLink] = useState<QuickLink | null>(null);
  const [qlLoading, setQLLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const resolvedNewType = showCustomInput ? newCustomType : newLinkType;

  const handleAddQuickLink = async () => {
    if (!newName.trim() || !newUrl.trim()) return;
    setQLLoading(true);
    await createQuickLink(newName.trim(), newUrl.trim(), null, resolvedNewType || null);
    setNewName('');
    setNewUrl('');
    setNewLinkType('');
    setNewCustomType('');
    setShowCustomInput(false);
    setShowAddForm(false);
    setQLLoading(false);
  };

  const handleUpdateQuickLink = async () => {
    if (!editingQuickLink) return;
    setQLLoading(true);
    const finalType = showEditCustomInput ? editCustomType : editingQuickLink.link_type;
    await updateQuickLink(
      editingQuickLink.id,
      editingQuickLink.name,
      editingQuickLink.url,
      editingQuickLink.content_type_id,
      finalType || null,
    );
    setEditingQuickLink(null);
    setShowEditCustomInput(false);
    setEditCustomType('');
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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary" />
            QuickLinks
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add form */}
          {showAddForm && (
            <div className="p-3 border border-border bg-muted/30 space-y-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  placeholder="e.g. ChatGPT"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                {showCustomInput ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter custom type..."
                      value={newCustomType}
                      onChange={(e) => setNewCustomType(e.target.value)}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => { setShowCustomInput(false); setNewCustomType(''); }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Select
                    value={newLinkType || '__none__'}
                    onValueChange={(v) => {
                      if (v === '__custom__') {
                        setShowCustomInput(true);
                        setNewLinkType('');
                      } else {
                        setNewLinkType(v === '__none__' ? '' : v);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="__none__">No type</SelectItem>
                      {QUICKLINK_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                      <SelectItem value="__custom__">+ Add custom...</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleAddQuickLink}
                  disabled={qlLoading || !newName.trim() || !newUrl.trim()}
                  size="sm"
                >
                  {qlLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName('');
                    setNewUrl('');
                    setNewLinkType('');
                    setNewCustomType('');
                    setShowCustomInput(false);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Links list */}
          {quickLinks.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No quicklinks yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Click "Add" to create your first quicklink
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {quickLinks.map((link) => (
                <div
                  key={link.id}
                  className="group relative flex flex-col gap-1 p-3 border border-border bg-muted/30 hover:bg-muted transition-colors"
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium min-w-0"
                  >
                    <ExternalLink className="h-4 w-4 text-primary flex-shrink-0" />
                    <span className="truncate">{link.name}</span>
                  </a>
                  {link.link_type && (
                    <Badge variant="secondary" className="text-xs w-fit">{link.link_type}</Badge>
                  )}
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
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
                        <DialogHeader>
                          <DialogTitle>Edit QuickLink</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={editingQuickLink?.name || ''}
                              onChange={(e) => setEditingQuickLink(prev =>
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                              value={editingQuickLink?.url || ''}
                              onChange={(e) => setEditingQuickLink(prev =>
                                prev ? { ...prev, url: e.target.value } : null
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Type</Label>
                            {showEditCustomInput ? (
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Enter custom type..."
                                  value={editCustomType}
                                  onChange={(e) => setEditCustomType(e.target.value)}
                                  className="flex-1"
                                  autoFocus
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setShowEditCustomInput(false);
                                    setEditCustomType('');
                                    setEditingQuickLink(prev => prev ? { ...prev, link_type: null } : null);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <Select
                                value={getLinkTypeSelectValue(editingQuickLink?.link_type ?? null)}
                                onValueChange={(v) => {
                                  if (v === '__custom__') {
                                    setShowEditCustomInput(true);
                                  } else {
                                    const val = v === '__none__' ? null : v;
                                    setEditingQuickLink(prev => prev ? { ...prev, link_type: val } : null);
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type..." />
                                </SelectTrigger>
                                <SelectContent className="bg-popover z-50">
                                  <SelectItem value="__none__">No type</SelectItem>
                                  {QUICKLINK_TYPES.map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
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
          )}
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingQuickLink} onOpenChange={(open) => !open && setDeletingQuickLink(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete QuickLink</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingQuickLink?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuickLink}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
