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
import { ExternalLink, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { QuickLink } from '@/types';

export function QuickLinksManager() {
  const {
    contentTypes,
    quickLinks,
    createQuickLink,
    updateQuickLink,
    deleteQuickLink,
  } = useIdea();

  const [newQuickLinkName, setNewQuickLinkName] = useState('');
  const [newQuickLinkUrl, setNewQuickLinkUrl] = useState('');
  const [newQuickLinkType, setNewQuickLinkType] = useState<string>('');
  const [editingQuickLink, setEditingQuickLink] = useState<QuickLink | null>(null);
  const [deletingQuickLink, setDeletingQuickLink] = useState<QuickLink | null>(null);
  const [qlLoading, setQLLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddQuickLink = async () => {
    if (!newQuickLinkName.trim() || !newQuickLinkUrl.trim()) return;
    setQLLoading(true);
    await createQuickLink(newQuickLinkName.trim(), newQuickLinkUrl.trim(), newQuickLinkType || null);
    setNewQuickLinkName('');
    setNewQuickLinkUrl('');
    setNewQuickLinkType('');
    setShowAddForm(false);
    setQLLoading(false);
  };

  const handleUpdateQuickLink = async () => {
    if (!editingQuickLink) return;
    setQLLoading(true);
    await updateQuickLink(
      editingQuickLink.id, 
      editingQuickLink.name, 
      editingQuickLink.url,
      editingQuickLink.content_type_id
    );
    setEditingQuickLink(null);
    setQLLoading(false);
  };

  const handleDeleteQuickLink = async () => {
    if (!deletingQuickLink) return;
    setQLLoading(true);
    await deleteQuickLink(deletingQuickLink.id);
    setDeletingQuickLink(null);
    setQLLoading(false);
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
            <div className="p-3 rounded-lg bg-muted/50 space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Input
                  placeholder="Name"
                  value={newQuickLinkName}
                  onChange={(e) => setNewQuickLinkName(e.target.value)}
                  className="w-32"
                />
                <Input
                  placeholder="URL"
                  value={newQuickLinkUrl}
                  onChange={(e) => setNewQuickLinkUrl(e.target.value)}
                  className="flex-1 min-w-[150px]"
                />
                <Select
                  value={newQuickLinkType || "__all__"}
                  onValueChange={(v) => setNewQuickLinkType(v === "__all__" ? "" : v)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent position="popper" side="bottom" className="bg-popover">
                    <SelectItem value="__all__">All types</SelectItem>
                    {contentTypes.map((ct) => (
                      <SelectItem key={ct.id} value={ct.id}>
                        {ct.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleAddQuickLink} 
                  disabled={qlLoading || !newQuickLinkName.trim() || !newQuickLinkUrl.trim()}
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
                    setNewQuickLinkName('');
                    setNewQuickLinkUrl('');
                    setNewQuickLinkType('');
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
                  className="group relative flex items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
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
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => setEditingQuickLink({ ...link })}
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
                            <Label>Idea Type Filter</Label>
                            <Select 
                              value={editingQuickLink?.content_type_id || "__all__"} 
                              onValueChange={(v) => setEditingQuickLink(prev => 
                                prev ? { ...prev, content_type_id: v === "__all__" ? null : v } : null
                              )}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="All types" />
                              </SelectTrigger>
                              <SelectContent position="popper" side="bottom" className="bg-popover">
                                <SelectItem value="__all__">All types</SelectItem>
                                {contentTypes.map((ct) => (
                                  <SelectItem key={ct.id} value={ct.id}>
                                    {ct.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
