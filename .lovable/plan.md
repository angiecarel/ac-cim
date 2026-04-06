

# Add Visual Workflow Builder

A new sidebar item called "Workflows" that gives you a node-based canvas for sketching out systems, automations, and agent architectures before they become ideas.

## Approach

Use **React Flow** (`@xyflow/react`), a mature, well-supported library for node-based diagrams. It handles dragging, connecting, zooming, and panning out of the box.

## Database

New `workflows` table storing each workflow (title, description, user_id), and a `workflow_data` JSON column holding the React Flow nodes and edges. This keeps it simple — one row per workflow, all canvas state serialized as JSON.

```text
workflows
├── id (uuid, PK)
├── user_id (uuid)
├── title (text)
├── description (text, nullable)
├── workflow_data (jsonb) ← nodes, edges, viewport
├── created_at (timestamptz)
└── updated_at (timestamptz)
```

RLS: users can CRUD their own rows only.

## Features

- **Multiple node shapes**: Rectangle (process), Diamond (decision), Circle (start/end), Rounded rectangle (action). Each shape is a custom React Flow node component.
- **Node colors**: A color picker on each node (reusing your existing palette or a simple preset list).
- **Editable labels**: Click a node to edit its text inline.
- **Connectable with arrows**: Drag from handle to handle to create directed edges. Edges render as arrows.
- **Add nodes**: Toolbar with shape buttons — click to drop a new node onto the canvas.
- **Save/load**: Auto-save or manual save. Workflow list page to manage multiple workflows.
- **Promote to idea**: Optional action to convert a workflow into an idea in the Idea Bucket.

## UI Structure

1. **Workflows list page** (`/workflows`) — simple list of saved workflows with create/delete actions, matching the log list pattern.
2. **Workflow editor page** (`/workflows/:id`) — full-screen React Flow canvas with a floating toolbar for adding shapes, changing colors, and saving.

## File Changes

| File | Change |
|---|---|
| `package.json` | Add `@xyflow/react` |
| **New** migration | Create `workflows` table with RLS |
| `src/hooks/useWorkflows.ts` | CRUD hook for workflows |
| `src/pages/Workflows.tsx` | List view |
| `src/pages/WorkflowEditor.tsx` | Canvas editor with React Flow |
| `src/components/workflows/ShapeNode.tsx` | Custom node components (rect, diamond, circle, rounded) |
| `src/components/workflows/WorkflowToolbar.tsx` | Floating toolbar for adding nodes, color picker |
| `src/components/layout/AppSidebar.tsx` | Add "Workflows" nav item with `Workflow` icon |
| `src/App.tsx` | Add routes for `/workflows` and `/workflows/:id` |

## Sidebar Addition

New nav item between "Resources" and "Quick Links":
```
{ path: '/workflows', label: 'Workflows', icon: Workflow }
```

Uses the `Workflow` icon from lucide-react (a connected-nodes icon).

