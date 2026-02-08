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
import { 
  FileType, 
  Layers, 
  Plus, 
  Pencil, 
  Trash2,
  Loader2
} from 'lucide-react';
import { ContentType, Platform } from '@/types';
import { ChangePasswordCard } from '@/components/settings/ChangePasswordCard';
import { ZapierSettings } from '@/components/settings/ZapierSettings';

export function ManageSettings() {
  const {
    contentTypes,
    createContentType,
    updateContentType,
    deleteContentType,
    platforms,
    createPlatform,
    updatePlatform,
    deletePlatform,
  } = useIdea();

  // Content Types state
  const [newContentTypeName, setNewContentTypeName] = useState('');
  const [editingContentType, setEditingContentType] = useState<ContentType | null>(null);
  const [deletingContentType, setDeletingContentType] = useState<ContentType | null>(null);
  const [ctLoading, setCTLoading] = useState(false);

  // Platforms state
  const [newPlatformName, setNewPlatformName] = useState('');
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [deletingPlatform, setDeletingPlatform] = useState<Platform | null>(null);
  const [platformLoading, setPlatformLoading] = useState(false);


  // Content Types handlers
  const handleAddContentType = async () => {
    if (!newContentTypeName.trim()) return;
    setCTLoading(true);
    await createContentType(newContentTypeName.trim());
    setNewContentTypeName('');
    setCTLoading(false);
  };

  const handleUpdateContentType = async () => {
    if (!editingContentType) return;
    setCTLoading(true);
    await updateContentType(editingContentType.id, editingContentType.name);
    setEditingContentType(null);
    setCTLoading(false);
  };

  const handleDeleteContentType = async () => {
    if (!deletingContentType) return;
    setCTLoading(true);
    await deleteContentType(deletingContentType.id);
    setDeletingContentType(null);
    setCTLoading(false);
  };

  // Platform handlers
  const handleAddPlatform = async () => {
    if (!newPlatformName.trim()) return;
    setPlatformLoading(true);
    await createPlatform(newPlatformName.trim());
    setNewPlatformName('');
    setPlatformLoading(false);
  };

  const handleUpdatePlatform = async () => {
    if (!editingPlatform) return;
    setPlatformLoading(true);
    await updatePlatform(editingPlatform.id, editingPlatform.name);
    setEditingPlatform(null);
    setPlatformLoading(false);
  };

  const handleDeletePlatform = async () => {
    if (!deletingPlatform) return;
    setPlatformLoading(true);
    await deletePlatform(deletingPlatform.id);
    setDeletingPlatform(null);
    setPlatformLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gradient">Manage Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your account, idea types, and contexts
        </p>
      </div>

      {/* Account Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ChangePasswordCard />
      </div>

      {/* Zapier Integration */}
      <div className="grid lg:grid-cols-2 gap-6">
        <ZapierSettings />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Idea Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileType className="h-5 w-5 text-primary" />
              Idea Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new */}
            <div className="flex gap-2">
              <Input
                placeholder="New idea type..."
                value={newContentTypeName}
                onChange={(e) => setNewContentTypeName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddContentType()}
              />
              <Button onClick={handleAddContentType} disabled={ctLoading || !newContentTypeName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {contentTypes.map((ct) => (
                <div key={ct.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <span>{ct.name}</span>
                    {ct.is_system && (
                      <Badge variant="secondary" className="text-xs">System</Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setEditingContentType({ ...ct })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Idea Type</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={editingContentType?.name || ''}
                              onChange={(e) => setEditingContentType(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <Button onClick={handleUpdateContentType} disabled={ctLoading} className="w-full">
                            {ctLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    {!ct.is_system && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeletingContentType(ct)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contexts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Contexts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add new */}
            <div className="flex gap-2">
              <Input
                placeholder="Context name..."
                value={newPlatformName}
                onChange={(e) => setNewPlatformName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddPlatform()}
                className="flex-1"
              />
              <Button onClick={handleAddPlatform} disabled={platformLoading || !newPlatformName.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {platforms.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                  <span>{p.name}</span>
                  <div className="flex gap-1">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => setEditingPlatform({ ...p })}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Context</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                              value={editingPlatform?.name || ''}
                              onChange={(e) => setEditingPlatform(prev => 
                                prev ? { ...prev, name: e.target.value } : null
                              )}
                            />
                          </div>
                          <Button onClick={handleUpdatePlatform} disabled={platformLoading} className="w-full">
                            {platformLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Save Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeletingPlatform(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmations */}
      <AlertDialog open={!!deletingContentType} onOpenChange={(open) => !open && setDeletingContentType(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Content Type?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the content type. Ideas using this type will have their type cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteContentType} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingPlatform} onOpenChange={(open) => !open && setDeletingPlatform(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Platform?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the platform. Ideas using this platform will have their platform cleared.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePlatform} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
