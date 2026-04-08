import React, { useCallback, useEffect, useState } from 'react';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  ReactFlow,
  type DefaultEdgeOptions,
  type Edge,
  type FitViewOptions,
  type Node,
  type OnConnect,
  type OnEdgesChange,
  type OnNodesChange,
} from '@xyflow/react';
import { Modal } from '../../../shared/components/Modal';
import { adminApi } from '../api/adminApi';
import { showError } from '../../../shared/configs/toastConfig';
import type { LineageEvent } from '../api/adminTypes';
import LineageNode from './LineageNode';
import { Spinner } from '../../../shared/components/Spinner';
import { useCurrentTheme } from '../../../shared/hooks/useTheme';

const nodeTypes = { lineageNode: LineageNode };

const fitViewOptions: FitViewOptions = { padding: 0.2 };
const defaultEdgeOptions: DefaultEdgeOptions = { animated: true };

interface LineageModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  entityId: string;
}

const LineageModal: React.FC<LineageModalProps> = ({ isOpen, onClose, entityType, entityId }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useCurrentTheme();
  const backgroundPattern = theme === 'dark' ? '/graph-paper-dark.svg' : '/graph-paper-light.svg';
  const edgeColor = getComputedStyle(document.documentElement).getPropertyValue('--color-primary').trim();

  useEffect(() => {
    if (edges.length === 0) return;
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        style: { stroke: edgeColor },
        markerEnd: { type: MarkerType.ArrowClosed, width: 30, height: 30, color: edgeColor },
      })),
    );
  }, [theme]);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
  );

  useEffect(() => {
    if (!isOpen || !entityType || !entityId) return;

    const fetchLineage = async () => {
      setLoading(true);
      try {
        const response = await adminApi.logs.getEntityLineage(entityType, entityId);
        const lineage = response.data;

        const newNodes: Node[] = [];
        const newEdges: Edge[] = [];

        lineage.events.forEach((e: LineageEvent, i: number) => {
          const id = `${lineage.entityType}.${lineage.entityId}.${e.step}`;
          newNodes.push({
            id,
            type: 'lineageNode',
            position: { x: i * 300, y: 0 },
            data: { ...e, isLast: e.step === lineage.totalEvents },
          });

          if (i < lineage.events.length - 1) {
            const nextNodeId = `${lineage.entityType}.${lineage.entityId}.${lineage.events[i + 1].step}`;
            newEdges.push({
              id: `${id}-${nextNodeId}`,
              source: id,
              target: nextNodeId,
              style: { stroke: edgeColor },
              markerEnd: { type: MarkerType.ArrowClosed, width: 30, height: 30, color: edgeColor },
            });
          }
        });

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err: any) {
        showError(err.response?.data?.error || 'Failed to fetch entity lineage');
      } finally {
        setLoading(false);
      }
    };

    fetchLineage();
  }, [isOpen, entityType, entityId]);

  const handleClose = () => {
    setNodes([]);
    setEdges([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Lineage — ${entityType} · ${entityId}`}
      size="fullscreen"
      bodyStyle={{ overflow: 'hidden', padding: 0 }}
    >
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <Spinner size="large" />
        </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={fitViewOptions}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          style={{
            backgroundImage: `url(${backgroundPattern})`,
            backgroundSize: '40px 40px',
          }}
        />
      )}
    </Modal>
  );
};

export default LineageModal;
