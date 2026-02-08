import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Idea } from '@/types';
import { Sparkles, Loader2, Lightbulb, List, Type } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SparkDialogProps {
  idea: Idea;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SparkType = 'hooks' | 'outline' | 'titles';

export function SparkDialog({ idea, open, onOpenChange }: SparkDialogProps) {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<SparkType | null>(null);

  const generateSuggestions = async (sparkType: SparkType) => {
    setLoading(true);
    setActiveType(sparkType);
    setSuggestions(null);

    try {
      const { data, error } = await supabase.functions.invoke('cim-spark', {
        body: {
          title: idea.title,
          description: idea.description,
          content: idea.content,
          sparkType,
        },
      });

      if (error) throw error;
      
      if (data.error) {
        toast.error(data.error);
        return;
      }

      setSuggestions(data.suggestions);
    } catch (error) {
      console.error('Spark error:', error);
      toast.error('Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (suggestions) {
      navigator.clipboard.writeText(suggestions);
      toast.success('Copied to clipboard!');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            CIM Spark
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Get AI-powered suggestions for "<span className="font-medium">{idea.title}</span>"
          </p>

          {/* Spark Type Buttons */}
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={activeType === 'hooks' ? 'default' : 'outline'}
              onClick={() => generateSuggestions('hooks')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Lightbulb className="h-5 w-5" />
              <span className="text-xs">3 Hooks</span>
            </Button>
            <Button
              variant={activeType === 'outline' ? 'default' : 'outline'}
              onClick={() => generateSuggestions('outline')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <List className="h-5 w-5" />
              <span className="text-xs">Outline</span>
            </Button>
            <Button
              variant={activeType === 'titles' ? 'default' : 'outline'}
              onClick={() => generateSuggestions('titles')}
              disabled={loading}
              className="flex flex-col items-center gap-1 h-auto py-3"
            >
              <Type className="h-5 w-5" />
              <span className="text-xs">5 Titles</span>
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Generating ideas...</span>
            </div>
          )}

          {/* Suggestions Display */}
          {suggestions && !loading && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-4 whitespace-pre-wrap text-sm">
                {suggestions}
              </div>
              <Button variant="outline" size="sm" onClick={copyToClipboard} className="w-full">
                Copy to Clipboard
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!suggestions && !loading && (
            <div className="text-center py-6 text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Choose a spark type above to generate creative suggestions</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
