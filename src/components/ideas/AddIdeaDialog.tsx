import { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIdea } from '@/contexts/IdeaContext';
import { useAuth } from '@/contexts/AuthContext';
import { useContentTemplates, ContentTemplate } from '@/hooks/useContentTemplates';
import { IdeaPriority, EnergyLevel, TimeEstimate } from '@/types';
import { Loader2, FileText, ChevronDown } from 'lucide-react';
import { TagMultiSelect } from './TagMultiSelect';

interface AddIdeaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddIdeaDialog({ open, onOpenChange }: AddIdeaDialogProps) {
  if (!open) return null;
  return <AddIdeaDialogInner open={open} onOpenChange={onOpenChange} />;
}

function AddIdeaDialogInner({ open, onOpenChange }: AddIdeaDialogProps) {
  const { user } = useAuth();
  const { createIdea, contentTypes, tags, createTag, setIdeaTags } = useIdea();
  const { templates } = useContentTemplates(user?.id);
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [contentTypeId, setContentTypeId] = useState<string>('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [priority, setPriority] = useState<IdeaPriority>('none');
  const [isTimely, setIsTimely] = useState(false);
  const [source, setSource] = useState('');
  const [nextAction, setNextAction] = useState('');
  const [energyLevel, setEnergyLevel] = useState<EnergyLevel | ''>('');
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimate | ''>('');
  const [templatePopoverOpen, setTemplatePopoverOpen] = useState(false);

  // Filter templates based on selected content type
  const availableTemplates = useMemo(() => {
    if (!contentTypeId) return templates;
    return templates.filter(t => !t.content_type_id || t.content_type_id === contentTypeId);
  }, [templates, contentTypeId]);

  useEffect(() => {
    if (open) {
      setTitle('');
      setDescription('');
      setContent('');
      setContentTypeId('');
      setSelectedTagIds([]);
      setPriority('none');
      setIsTimely(false);
      setSource('');
      setNextAction('');
      setEnergyLevel('');
      setTimeEstimate('');
    }
  }, [open]);

  const handleLoadTemplate = (template: ContentTemplate) => {
    setContent(template.template_content);
    if (template.content_type_id && !contentTypeId) {
      setContentTypeId(template.content_type_id);
    }
    setTemplatePopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    const newIdea = await createIdea({
      title: title.trim(),
      description: description.trim() || null,
      content: content.trim() || null,
      content_type_id: contentTypeId || null,
      platform_id: null,
      priority,
      is_timely: isTimely,
      source: source.trim() || null,
      next_action: nextAction.trim() || null,
      energy_level: energyLevel || null,
      time_estimate: timeEstimate || null,
    });
    
    // Set tags for the new idea
    if (newIdea && selectedTagIds.length > 0) {
      await setIdeaTags(newIdea.id, selectedTagIds);
    }
    
    setLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient">Add New Idea</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="What's your idea?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notes/Content with Load Template */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Notes</Label>
              {availableTemplates.length > 0 && (
                <Popover open={templatePopoverOpen} onOpenChange={setTemplatePopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" size="sm" className="h-7 text-xs gap-1">
                      <FileText className="h-3 w-3" />
                      Load Template
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-2" align="end">
                    <div className="space-y-1">
                      {availableTemplates.map((template) => (
                        <Button
                          key={template.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-sm"
                          onClick={() => handleLoadTemplate(template)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              )}
            </div>
            <Textarea
              id="content"
              placeholder="Add notes, structure, or ideas..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contentType">Idea Type</Label>
            <Select value={contentTypeId || "__none__"} onValueChange={(v) => setContentTypeId(v === "__none__" ? "" : v)}>
              <SelectTrigger id="contentType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="bg-popover">
                <SelectItem value="__none__">None</SelectItem>
                {contentTypes.map((ct) => (
                  <SelectItem key={ct.id} value={ct.id}>
                    {ct.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagMultiSelect
              tags={tags}
              selectedTagIds={selectedTagIds}
              onTagsChange={setSelectedTagIds}
              onCreateTag={createTag}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(v) => setPriority(v as IdeaPriority)}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" side="bottom" className="bg-popover">
                <SelectItem value="none">No Priority</SelectItem>
                <SelectItem value="good">Good</SelectItem>
                <SelectItem value="better">Better</SelectItem>
                <SelectItem value="best">Best</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="timely">Timely</Label>
              <p className="text-xs text-muted-foreground">Mark for same-day attention</p>
            </div>
            <Switch
              id="timely"
              checked={isTimely}
              onCheckedChange={setIsTimely}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="Where did this come from? (podcast, conversation, etc.)"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextAction">Next Action</Label>
            <Textarea
              id="nextAction"
              placeholder="What's the very next step to move this forward?"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              rows={2}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="energyLevel">Energy Level</Label>
              <Select value={energyLevel} onValueChange={(v) => setEnergyLevel(v as EnergyLevel)}>
                <SelectTrigger id="energyLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="bg-popover">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeEstimate">Time Estimate</Label>
              <Select value={timeEstimate} onValueChange={(v) => setTimeEstimate(v as TimeEstimate)}>
                <SelectTrigger id="timeEstimate">
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" className="bg-popover">
                  <SelectItem value="quick">Quick (minutes)</SelectItem>
                  <SelectItem value="hour">Hour</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week_plus">Week+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-creative hover:opacity-90" disabled={loading || !title.trim()}>
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Idea
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
