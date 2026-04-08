import { memo, useState, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';

const PRESET_COLORS = [
  '#f3f4f6', '#fef3c7', '#dcfce7', '#dbeafe', '#ede9fe', '#fce7f3', '#ffedd5',
  '#000000', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
];

interface ShapeNodeData {
  label: string;
  shape: 'rectangle' | 'diamond' | 'circle' | 'rounded';
  color: string;
  onLabelChange?: (id: string, label: string) => void;
  onColorChange?: (id: string, color: string) => void;
}

function ShapeNodeComponent({ id, data, selected }: NodeProps) {
  const nodeData = data as unknown as ShapeNodeData;
  const [editing, setEditing] = useState(false);
  const [showColors, setShowColors] = useState(false);
  const [labelValue, setLabelValue] = useState(nodeData.label);

  const handleDoubleClick = useCallback(() => setEditing(true), []);
  const handleBlur = useCallback(() => {
    setEditing(false);
    nodeData.onLabelChange?.(id, labelValue);
  }, [id, labelValue, nodeData]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleBlur(); }
  }, [handleBlur]);

  const isDark = nodeData.color === '#000000';
  const textColor = isDark ? 'white' : 'black';

  const shapeStyles: Record<string, string> = {
    rectangle: 'rounded-md',
    diamond: 'rotate-45 rounded-sm',
    circle: 'rounded-full',
    rounded: 'rounded-2xl',
  };

  const sizeStyles: Record<string, string> = {
    rectangle: 'min-w-[120px] min-h-[60px]',
    diamond: 'w-[90px] h-[90px]',
    circle: 'w-[90px] h-[90px]',
    rounded: 'min-w-[120px] min-h-[60px]',
  };

  return (
    <div className="relative group">
      <Handle type="target" position={Position.Top} id="top-target" className="!w-2 !h-2 !bg-primary" />
      <Handle type="source" position={Position.Top} id="top-source" className="!w-2 !h-2 !bg-primary" />
      <Handle type="target" position={Position.Left} id="left-target" className="!w-2 !h-2 !bg-primary" />
      <Handle type="source" position={Position.Left} id="left-source" className="!w-2 !h-2 !bg-primary" />

      <div
        className={`${shapeStyles[nodeData.shape]} ${sizeStyles[nodeData.shape]} flex items-center justify-center border-2 px-3 py-2 cursor-pointer transition-shadow ${selected ? 'shadow-lg ring-2 ring-primary' : 'shadow-sm'}`}
        style={{ backgroundColor: nodeData.color, borderColor: isDark ? '#333' : '#d1d5db' }}
        onDoubleClick={handleDoubleClick}
        onContextMenu={(e) => { e.preventDefault(); setShowColors(!showColors); }}
      >
        <div className={nodeData.shape === 'diamond' ? '-rotate-45' : ''}>
          {editing ? (
            <input
              autoFocus
              value={labelValue}
              onChange={(e) => setLabelValue(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="bg-transparent text-center text-xs font-medium outline-none w-full min-w-[60px]"
              style={{ color: textColor }}
            />
          ) : (
            <span className="text-xs font-medium text-center block select-none" style={{ color: textColor }}>
              {nodeData.label}
            </span>
          )}
        </div>
      </div>

      <Handle type="target" position={Position.Bottom} id="bottom-target" className="!w-2 !h-2 !bg-primary" />
      <Handle type="source" position={Position.Bottom} id="bottom-source" className="!w-2 !h-2 !bg-primary" />
      <Handle type="target" position={Position.Right} id="right-target" className="!w-2 !h-2 !bg-primary" />
      <Handle type="source" position={Position.Right} id="right-source" className="!w-2 !h-2 !bg-primary" />

      {showColors && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-50 flex gap-1 bg-popover border rounded-lg p-1.5 shadow-lg">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              className="w-5 h-5 rounded-full border border-border hover:scale-110 transition-transform"
              style={{ backgroundColor: c }}
              onClick={() => { nodeData.onColorChange?.(id, c); setShowColors(false); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export const ShapeNode = memo(ShapeNodeComponent);
