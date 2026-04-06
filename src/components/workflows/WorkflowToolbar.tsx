import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Square, Diamond, Circle, RectangleHorizontal, Save, ArrowLeft, Lightbulb } from 'lucide-react';

interface WorkflowToolbarProps {
  onAddNode: (shape: 'rectangle' | 'diamond' | 'circle' | 'rounded') => void;
  onSave: () => void;
  onBack: () => void;
  onPromote?: () => void;
  saving?: boolean;
}

const shapes = [
  { shape: 'rectangle' as const, icon: Square, label: 'Process' },
  { shape: 'diamond' as const, icon: Diamond, label: 'Decision' },
  { shape: 'circle' as const, icon: Circle, label: 'Start/End' },
  { shape: 'rounded' as const, icon: RectangleHorizontal, label: 'Action' },
];

export function WorkflowToolbar({ onAddNode, onSave, onBack, onPromote, saving }: WorkflowToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
      <div className="flex gap-1 bg-card/90 backdrop-blur border rounded-lg p-1 shadow-lg">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Back to list</TooltipContent>
        </Tooltip>

        <div className="w-px bg-border mx-0.5" />

        {shapes.map(({ shape, icon: Icon, label }) => (
          <Tooltip key={shape}>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onAddNode(shape)}>
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{label}</TooltipContent>
          </Tooltip>
        ))}

        <div className="w-px bg-border mx-0.5" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onSave} disabled={saving}>
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Save</TooltipContent>
        </Tooltip>

        {onPromote && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPromote}>
                <Lightbulb className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Promote to Idea</TooltipContent>
          </Tooltip>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground ml-1">Double-click node to edit · Right-click for colors</p>
    </div>
  );
}
