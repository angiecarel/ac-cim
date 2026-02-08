import { useState } from 'react';
import { X, Plus, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tag } from '@/types';
import { cn } from '@/lib/utils';

interface TagMultiSelectProps {
  tags: Tag[];
  selectedTagIds: string[];
  onTagsChange: (tagIds: string[]) => void;
  onCreateTag?: (name: string) => Promise<Tag | null>;
}

export function TagMultiSelect({
  tags,
  selectedTagIds,
  onTagsChange,
  onCreateTag,
}: TagMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [creating, setCreating] = useState(false);

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id));
  const availableTags = tags.filter(t => !selectedTagIds.includes(t.id));

  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onTagsChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTagIds, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim() || !onCreateTag) return;
    
    setCreating(true);
    const newTag = await onCreateTag(newTagName.trim());
    setCreating(false);
    
    if (newTag) {
      onTagsChange([...selectedTagIds, newTag.id]);
      setNewTagName('');
    }
  };

  return (
    <div className="space-y-2">
      {/* Selected tags display */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {selectedTags.length === 0 ? (
          <span className="text-sm text-muted-foreground">No tags selected</span>
        ) : (
          selectedTags.map(tag => (
            <Badge
              key={tag.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
              style={{ backgroundColor: `${tag.color}20`, borderColor: tag.color }}
            >
              <span style={{ color: tag.color }}>{tag.name}</span>
              <button
                type="button"
                onClick={() => toggleTag(tag.id)}
                className="hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))
        )}
      </div>

      {/* Tag selector popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add tags
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-2" align="start">
          <div className="space-y-2">
            {/* Available tags */}
            <div className="max-h-40 overflow-y-auto space-y-1">
              {tags.map(tag => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => toggleTag(tag.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm hover:bg-muted transition-colors",
                      isSelected && "bg-muted"
                    )}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1 text-left">{tag.name}</span>
                    {isSelected && <Check className="h-4 w-4 text-primary" />}
                  </button>
                );
              })}
              {tags.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No tags yet
                </p>
              )}
            </div>

            {/* Create new tag */}
            {onCreateTag && (
              <div className="border-t pt-2">
                <div className="flex gap-1">
                  <Input
                    placeholder="New tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateTag();
                      }
                    }}
                    className="h-8 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || creating}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
