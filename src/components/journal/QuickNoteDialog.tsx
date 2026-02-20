import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SystemNote } from '@/hooks/useSystems';
import { NoteColor } from '@/hooks/useNoteColors';
import { StickyNote, Check, Plus, Pencil, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// Fallback colors if user has no custom colors
const DEFAULT_COLORS = [
  { id: 'default-yellow', name: 'Yellow', hex_color: '#fef3c7' },
  { id: 'default-green', name: 'Green', hex_color: '#dcfce7' },
  { id: 'default-blue', name: 'Blue', hex_color: '#dbeafe' },
  { id: 'default-purple', name: 'Purple', hex_color: '#ede9fe' },
  { id: 'default-pink', name: 'Pink', hex_color: '#fce7f3' },
  { id: 'default-orange', name: 'Orange', hex_color: '#ffedd5' },
  { id: 'default-gray', name: 'Gray', hex_color: '#f3f4f6' },
];

export function getColorStyle(hexColor: string | null, colors: NoteColor[]) {
  if (!hexColor) {
    return { bg: '#f3f4f6', border: '#d1d5db' };
  }
  // Check if it's a legacy color name
  const legacyColor = DEFAULT_COLORS.find(c => c.name.toLowerCase() === hexColor?.toLowerCase());
  if (legacyColor) {
    return { bg: legacyColor.hex_color, border: adjustColor(legacyColor.hex_color, -20) };
  }
  // Check if it's a hex color
  if (hexColor.startsWith('#')) {
    return { bg: hexColor, border: adjustColor(hexColor, -20) };
  }
  // Check in user's custom colors
  const customColor = colors.find(c => c.id === hexColor || c.hex_color === hexColor);
  if (customColor) {
    return { bg: customColor.hex_color, border: adjustColor(customColor.hex_color, -20) };
  }
  return { bg: '#f3f4f6', border: '#d1d5db' };
}

// Helper to darken/lighten a hex color
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

interface Platform {
  id: string;
  name: string;
}

interface Idea {
  id: string;
  title: string;
  status: string;
}

interface QuickNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingNote?: SystemNote | null;
  platforms: Platform[];
  ideas: Idea[];
  noteColors: NoteColor[];
  onSave: (data: {
    title: string;
    content: string;
    platform_id: string | null;
    idea_id: string | null;
    color: string | null;
  }) => void;
  onCreateColor: (name: string, hexColor: string) => Promise<NoteColor | null>;
  onUpdateColor: (id: string, updates: { name?: string; hex_color?: string }) => Promise<void>;
  onDeleteColor: (id: string) => Promise<void>;
  onCreateIdea?: (title: string) => Promise<{ id: string; title: string } | null>;
}

export function QuickNoteDialog({
  open,
  onOpenChange,
  editingNote,
  platforms,
  ideas,
  noteColors,
  onSave,
  onCreateColor,
  onUpdateColor,
  onDeleteColor,
  onCreateIdea,
}: QuickNoteDialogProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [ideaId, setIdeaId] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  // Color management state
  const [showAddColor, setShowAddColor] = useState(false);
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#fbbf24');
  const [editingColor, setEditingColor] = useState<NoteColor | null>(null);

  // Inline idea creation state
  const [showNewIdeaInput, setShowNewIdeaInput] = useState(false);
  const [newIdeaTitle, setNewIdeaTitle] = useState('');
  const [creatingIdea, setCreatingIdea] = useState(false);
  const newIdeaInputRef = useRef<HTMLInputElement>(null);

  const displayColors = noteColors.length > 0 ? noteColors : DEFAULT_COLORS.map(c => ({
    ...c,
    user_id: '',
    sort_order: 0,
    created_at: '',
    updated_at: '',
  }));

  const linkableIdeas = ideas.filter((i) => !['archived', 'recycled'].includes(i.status));

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setContent(editingNote.content || '');
      setPlatformId(editingNote.platform_id || '');
      setIdeaId(editingNote.idea_id || '');
      // Handle legacy color names by finding the matching hex
      const legacyColor = DEFAULT_COLORS.find(c => c.name.toLowerCase() === editingNote.color?.toLowerCase());
      if (legacyColor) {
        setSelectedColor(legacyColor.hex_color);
      } else {
        setSelectedColor(editingNote.color || displayColors[0]?.hex_color || '#fef3c7');
      }
    } else {
      setTitle('');
      setContent('');
      setPlatformId('');
      setIdeaId('');
      setSelectedColor(displayColors[0]?.hex_color || '#fef3c7');
    }
  }, [editingNote, open, displayColors]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      content: content.trim() || '',
      platform_id: platformId || null,
      idea_id: ideaId || null,
      color: selectedColor || null,
    });
    onOpenChange(false);
  };

  const handleCreateNewIdea = async () => {
    if (!newIdeaTitle.trim() || !onCreateIdea) return;
    setCreatingIdea(true);
    const created = await onCreateIdea(newIdeaTitle.trim());
    setCreatingIdea(false);
    if (created) {
      setIdeaId(created.id);
      setShowNewIdeaInput(false);
      setNewIdeaTitle('');
    }
  };

  const handleCancelNewIdea = () => {
    setShowNewIdeaInput(false);
    setNewIdeaTitle('');
  };


  const handleAddColor = async () => {
    if (!newColorName.trim() || !newColorHex) return;
    const result = await onCreateColor(newColorName.trim(), newColorHex);
    if (result) {
      setSelectedColor(result.hex_color);
      setNewColorName('');
      setNewColorHex('#fbbf24');
      setShowAddColor(false);
    }
  };

  const handleUpdateColor = async () => {
    if (!editingColor) return;
    await onUpdateColor(editingColor.id, {
      name: editingColor.name,
      hex_color: editingColor.hex_color,
    });
    setEditingColor(null);
  };

  const handleDeleteColor = async (id: string) => {
    await onDeleteColor(id);
    if (selectedColor === noteColors.find(c => c.id === id)?.hex_color) {
      setSelectedColor(displayColors[0]?.hex_color || '#fef3c7');
    }
  };

  const colorStyle = getColorStyle(selectedColor, noteColors);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5" />
            {editingNote ? 'Edit Quick Note' : 'New Quick Note'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Color Selection */}
          <div>
            <Label className="mb-2 block">Color</Label>
            <div className="flex gap-2 flex-wrap items-center">
              {displayColors.map((colorOption) => (
                <Popover key={colorOption.id}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => {
                        if (!e.defaultPrevented) {
                          setSelectedColor(colorOption.hex_color);
                        }
                      }}
                      className={cn(
                        'h-8 w-8 rounded-md border-2 transition-all relative group',
                        selectedColor === colorOption.hex_color
                          ? 'ring-2 ring-primary ring-offset-2'
                          : 'hover:ring-1 hover:ring-primary/50'
                      )}
                      style={{ 
                        backgroundColor: colorOption.hex_color,
                        borderColor: adjustColor(colorOption.hex_color, -20)
                      }}
                      title={colorOption.name}
                    >
                      {selectedColor === colorOption.hex_color && (
                        <Check className="h-4 w-4 mx-auto text-foreground" />
                      )}
                    </button>
                  </PopoverTrigger>
                  {noteColors.length > 0 && colorOption.user_id && (
                    <PopoverContent className="w-48 p-2" align="start">
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{colorOption.name}</p>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => setEditingColor(colorOption)}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteColor(colorOption.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  )}
                </Popover>
              ))}
              
              {/* Add new color button */}
              <button
                type="button"
                onClick={() => setShowAddColor(true)}
                className="h-8 w-8 rounded-md border-2 border-dashed border-muted-foreground/50 flex items-center justify-center hover:border-primary transition-colors"
                title="Add custom color"
              >
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            
            {/* Add Color Form */}
            {showAddColor && (
              <div className="mt-3 p-3 rounded-md border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">New Color</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setShowAddColor(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    placeholder="Color name..."
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleAddColor} disabled={!newColorName.trim()}>
                    Add
                  </Button>
                </div>
              </div>
            )}
            
            {/* Edit Color Form */}
            {editingColor && (
              <div className="mt-3 p-3 rounded-md border bg-muted/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Edit Color</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setEditingColor(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={editingColor.hex_color}
                    onChange={(e) => setEditingColor({ ...editingColor, hex_color: e.target.value })}
                    className="w-12 h-9 p-1 cursor-pointer"
                  />
                  <Input
                    value={editingColor.name}
                    onChange={(e) => setEditingColor({ ...editingColor, name: e.target.value })}
                    className="flex-1"
                  />
                  <Button size="sm" onClick={handleUpdateColor}>
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quick thought..."
              className="mt-1.5"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Note</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Capture your thought..."
              rows={3}
              className="mt-1.5"
            />
          </div>

          {/* Links Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Link to Context</Label>
              <Select value={platformId || '__none__'} onValueChange={(v) => setPlatformId(v === '__none__' ? '' : v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select context" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {platforms.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Link to Idea</Label>
              <Select value={ideaId || '__none__'} onValueChange={(v) => {
                if (v === '__create__') {
                  setShowNewIdeaInput(true);
                  setTimeout(() => newIdeaInputRef.current?.focus(), 50);
                } else {
                  setIdeaId(v === '__none__' ? '' : v);
                }
              }}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select idea" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None</SelectItem>
                  {linkableIdeas.map((i) => (
                    <SelectItem key={i.id} value={i.id}>
                      {i.title}
                    </SelectItem>
                  ))}
                  {onCreateIdea && (
                    <SelectItem value="__create__" className="text-primary font-medium">
                      <span className="flex items-center gap-1.5">
                        <Plus className="h-3.5 w-3.5" />
                        Create new idea…
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>

              {/* Inline new idea input */}
              {showNewIdeaInput && (
                <div className="flex gap-1.5 mt-2">
                  <Input
                    ref={newIdeaInputRef}
                    placeholder="New idea title…"
                    value={newIdeaTitle}
                    onChange={(e) => setNewIdeaTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateNewIdea();
                      if (e.key === 'Escape') handleCancelNewIdea();
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCreateNewIdea}
                    disabled={!newIdeaTitle.trim() || creatingIdea}
                    title="Create idea"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 shrink-0"
                    onClick={handleCancelNewIdea}
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div 
            className="p-3 rounded-md border"
            style={{ 
              backgroundColor: colorStyle.bg,
              borderColor: colorStyle.border
            }}
          >
            <p className="text-xs text-muted-foreground mb-1">Preview</p>
            <p className="font-medium text-sm">{title || 'Your title here...'}</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!title.trim()}>
              {editingNote ? 'Save Changes' : 'Create'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
