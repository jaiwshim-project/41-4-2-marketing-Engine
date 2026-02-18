'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import TriggerNode from './nodes/TriggerNode';
import DelayNode from './nodes/DelayNode';
import EmailNode from './nodes/EmailNode';
import ConditionNode from './nodes/ConditionNode';
import ActionNode from './nodes/ActionNode';
import BuilderToolbar from './BuilderToolbar';
import NodeConfigPanel from './panels/NodeConfigPanel';
import type { NodeType, SmSequenceNode, SmSequenceEdge } from '@/lib/stepmail/types';

const nodeTypes = {
  trigger: TriggerNode,
  delay: DelayNode,
  email: EmailNode,
  condition: ConditionNode,
  action: ActionNode,
};

interface SequenceBuilderProps {
  sequenceId: string;
}

export default function SequenceBuilder({ sequenceId }: SequenceBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([] as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([] as Edge[]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // 서버에서 플로우 로드
  useEffect(() => {
    fetch(`/api/stepmail/sequences/${sequenceId}`)
      .then(r => r.json())
      .then((data: { nodes: SmSequenceNode[]; edges: SmSequenceEdge[] }) => {
        if (data.nodes) {
          setNodes(data.nodes.map(n => ({
            id: n.id,
            type: n.node_type,
            position: { x: n.position_x, y: n.position_y },
            data: { label: n.label, config: n.config },
          })));
        }
        if (data.edges) {
          setEdges(data.edges.map(e => ({
            id: e.id,
            source: e.source_node_id,
            target: e.target_node_id,
            label: e.edge_label || undefined,
            data: e.condition,
          })));
        }
        setLoaded(true);
      })
      .catch(console.error);
  }, [sequenceId, setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = {
        ...connection,
        id: crypto.randomUUID(),
        label: connection.sourceHandle === 'yes' ? 'Yes' : connection.sourceHandle === 'no' ? 'No' : undefined,
      } as Edge;
      setEdges(eds => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  const saveFlow = useCallback(async () => {
    setIsSaving(true);
    try {
      await fetch('/api/stepmail/sequences/flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence_id: sequenceId,
          nodes: nodes.map(n => ({
            id: n.id,
            type: n.type,
            position: n.position,
            data: n.data,
          })),
          edges: edges.map(e => ({
            id: e.id,
            source: e.source,
            target: e.target,
            label: e.label,
            data: e.data,
          })),
        }),
      });
    } catch (err) {
      console.error('Save failed:', err);
    }
    setIsSaving(false);
  }, [nodes, edges, sequenceId]);

  const addNode = useCallback((nodeType: NodeType) => {
    const defaultConfigs: Record<NodeType, Record<string, unknown>> = {
      trigger: { trigger_type: 'manual' },
      delay: { amount: 1, unit: 'days' },
      email: { content_id: '', track_opens: true, track_clicks: true },
      condition: { condition_type: 'opened' },
      action: { action_type: 'add_tag', value: '' },
    };

    const newNode: Node = {
      id: crypto.randomUUID(),
      type: nodeType,
      position: {
        x: 200 + Math.random() * 200,
        y: 100 + nodes.length * 120,
      },
      data: {
        label: nodeType,
        config: defaultConfigs[nodeType],
      },
    };
    setNodes(nds => [...nds, newNode]);
  }, [nodes.length, setNodes]);

  const handleNodeConfigChange = useCallback((updatedData: Record<string, unknown>) => {
    if (!selectedNode) return;
    setNodes(nds => nds.map(n =>
      n.id === selectedNode.id ? { ...n, data: { ...n.data, ...updatedData } } : n
    ));
    setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...updatedData } } : null);
  }, [selectedNode, setNodes]);

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        빌더 로딩 중...
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 relative">
        <BuilderToolbar onAddNode={addNode} onSave={saveFlow} isSaving={isSaving} />
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          onPaneClick={() => setSelectedNode(null)}
          nodeTypes={nodeTypes}
          fitView
          className="bg-gray-50"
        >
          <Background gap={20} size={1} />
          <Controls />
          <MiniMap nodeStrokeWidth={3} />
        </ReactFlow>
      </div>
      {selectedNode && (
        <NodeConfigPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
          onChange={handleNodeConfigChange}
        />
      )}
    </div>
  );
}
