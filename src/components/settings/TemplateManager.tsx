import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContentTemplates, ContentTemplate } from '@/hooks/useContentTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { useIdea } from '@/contexts/IdeaContext';
import { Plus, Edit, Trash2, FileText, Loader2 } from 'lucide-react';

export function TemplateManager() {
  const { user } = useAuth();
  const { contentTypes } = useIdea();
  const { templates, loading, createTemplate, updateTemplate, deleteTemplate } = useContentTemplates(user?.id);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [name, setName] = useState('');
  const [templateContent, setTemplateContent] = useState('');
  const [contentTypeId, setContentTypeId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingTemplate(null);
    setName('');
    setTemplateContent('');
    setContentTypeId('');
    setDialogOpen(true);
  };

  const openEdit = (template: ContentTemplate) => {
    setEditingTemplate(template);
    setName(template.name);
    setTemplateContent(template.template_content);
    setContentTypeId(template.content_type_id || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!name.trim() || !templateContent.trim()) return;
    
    setSaving(true);
    if (editingTemplate) {
      await updateTemplate(editingTemplate.id, {
        name: name.trim(),
        template_content: templateContent.trim(),
        content_type_id: contentTypeId || null,
      });
    } else {
      await createTemplate(name.trim(), templateContent.trim(), contentTypeId || null);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
    }
  };

  const getContentTypeName = (id: string | null) => {
    if (!id) return 'All Types';
    const ct = contentTypes.find(c => c.id === id);
    return ct?.name || 'Unknown';
  };

  // Default template suggestions
  const defaultTemplates = [
    {
      name: 'Video Script',
      type: 'Video',
      content: `🎬 HOOK
[Attention-grabbing opening - 3-5 seconds]

📝 BODY
• Point 1:
• Point 2:
• Point 3:

✅ CTA (Call to Action)
[What should viewers do next?]`,
    },
    {
      name: 'Blog Post',
      type: 'Blog',
      content: `📖 INTRODUCTION
[Hook the reader + thesis statement]

📋 OUTLINE
## Section 1:
## Section 2:
## Section 3:

🎯 CONCLUSION
[Summary + CTA]`,
    },
    {
      name: 'Social Post',
      type: 'Social',
      content: `💡 HOOK
[First line that stops the scroll]

📝 VALUE
[Key insight or story]

👉 CTA
[What action should they take?]

#hashtags`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Content Templates
            </CardTitle>
            <CardDescription>
              Create reusable templates for different content types
            </CardDescription>
          </div>
          <Button onClick={openAdd} size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Template
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-4">No templates yet. Create one or use a starter template.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {defaultTemplates.map((dt) => (
                <Button
                  key={dt.name}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setName(dt.name);
                    setTemplateContent(dt.content);
                    setContentTypeId('');
                    setEditingTemplate(null);
                    setDialogOpen(true);
                  }}
                >
                  Use {dt.name} Template
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {templates.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{template.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {getContentTypeName(template.content_type_id)}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(template)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'Add Template'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateName">Template Name *</Label>
              <Input
                id="templateName"
                placeholder="e.g., Video Script, Blog Outline"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateType">Associated Idea Type (Optional)</Label>
              <Select value={contentTypeId || '__none__'} onValueChange={(v) => setContentTypeId(v === '__none__' ? '' : v)}>
                <SelectTrigger id="templateType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">All Types</SelectItem>
                  {contentTypes.map((ct) => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="templateContent">Template Content *</Label>
              <Textarea
                id="templateContent"
                placeholder="Enter your template structure..."
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !name.trim() || !templateContent.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editingTemplate ? 'Save Changes' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
