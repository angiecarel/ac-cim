import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  Background,
  Controls,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflows, type WorkflowData } from '@/hooks/useWorkflows';
import { ShapeNode } from '@/components/workflows/ShapeNode';
import { WorkflowToolbar } from '@/components/workflows/WorkflowToolbar';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const nodeTypes = { shape: ShapeNode };

function WorkflowEditorInner() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getWorkflow, updateWorkflow } = useWorkflows();
  const { screenToFlowPosition } = useReactFlow();

  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const nodeCounter = useRef(0);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const wf = await getWorkflow(id);
      if (!wf) { navigate('/workflows'); return; }
      setTitle(wf.title);
      const wd = wf.workflow_data as WorkflowData;
      // Re-attach callbacks to loaded nodes
      const loadedNodes = (wd.nodes || []).map((n: any) => ({
        ...n,
        data: { ...n.data, onLabelChange: handleLabelChange, onColorChange: handleColorChange },
      }));
      setNodes(loadedNodes);
      setEdges(wd.edges || []);
      nodeCounter.current = (wd.nodes?.length || 0) + 1;
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleLabelChange = useCallback((nodeId: string, label: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, label } } : n))
    );
  }, []);

  const handleColorChange = useCallback((nodeId: string, color: string) => {
    setNodes((nds) =>
      nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, color } } : n))
    );
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, markerEnd: { type: MarkerType.ArrowClosed }, animated: false }, eds)
      ),
    []
  );

  const addNode = useCallback(
    (shape: 'rectangle' | 'diamond' | 'circle' | 'rounded') => {
      const id = `node-${++nodeCounter.current}`;
      const position = screenToFlowPosition({ x: 300 + Math.random() * 100, y: 200 + Math.random() * 100 });
      const newNode: Node = {
        id,
        type: 'shape',
        position,
        data: {
          label: shape === 'diamond' ? 'Decision?' : shape === 'circle' ? 'Start' : 'New Step',
          shape,
          color: '#f3f4f6',
          onLabelChange: handleLabelChange,
          onColorChange: handleColorChange,
        },
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition, handleLabelChange, handleColorChange]
  );

  const handleSave = useCallback(async () => {
    if (!id) return;
    setSaving(true);
    // Strip callbacks before saving
    const cleanNodes = nodes.map(({ data, ...rest }) => ({
      ...rest,
      data: { label: (data as any).label, shape: (data as any).shape, color: (data as any).color },
    }));
    const ok = await updateWorkflow(id, {
      workflow_data: { nodes: cleanNodes, edges, viewport: { x: 0, y: 0, zoom: 1 } } as any,
    });
    setSaving(false);
    if (ok) toast({ title: 'Workflow saved' });
  }, [id, nodes, edges, updateWorkflow]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full relative">
      <WorkflowToolbar
        onAddNode={addNode}
        onSave={handleSave}
        onBack={() => navigate('/workflows')}
        saving={saving}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ markerEnd: { type: MarkerType.ArrowClosed } }}
        fitView
        deleteKeyCode={['Backspace', 'Delete']}
        className="bg-background"
      >
        <Background gap={20} size={1} />
        <Controls className="!bg-card !border !shadow-sm" />
      </ReactFlow>
    </div>
  );
}

export function WorkflowEditor() {
  return (
    <ReactFlowProvider>
      <WorkflowEditorInner />
    </ReactFlowProvider>
  );
}
