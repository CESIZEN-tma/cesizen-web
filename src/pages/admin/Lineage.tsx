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
} from "@xyflow/react";
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAdminLogs } from "../../services/admin-service/hooks/useAdminLogs";
import { toast } from "react-toastify";
import type { LineageEvent } from "../../services/admin-service/api/adminTypes";
import LineageNode from "../../services/admin-service/components/LineageNode";

const nodeTypes = { lineageNode: LineageNode };


const Lineage: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const { fetchEntityLineage } = useAdminLogs();

  const [searchParams] = useSearchParams();
  const entityType = searchParams.get("entityType");
  const entityId = searchParams.get("entityId");
  const navigate = useNavigate();

  if (!entityId || !entityType) {
    navigate("/");
    toast.error("Incorrects arguments for entity type or entity id");
    return;
  }

  const getEntityLineage = async () => {
    const lineage = await fetchEntityLineage(entityType, entityId);
    if (!lineage) return;

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    lineage.events.forEach((e: LineageEvent, i: number) => {
      const id = `${lineage.entityType}.${lineage.entityId}.${e.step}`;

      newNodes.push({
        id,
        type: 'lineageNode',
        position: { x: i * 300, y: 0 },
        data: { ...e, isLast: e.step === lineage.totalEvents }
      });

     if (i < lineage.events.length - 1) {
        console.log(i < lineage.events.length - 1)
        const nextNodeId = `${lineage.entityType}.${lineage.entityId}.${lineage.events[i + 1].step}`;
        newEdges.push({
          id: `${id}-${nextNodeId}`,
          source: id,
          target: nextNodeId,
          markerEnd: { type: MarkerType.ArrowClosed, width:30, height:30 },
        });
      }
    });

    setNodes(newNodes);
    setEdges(newEdges);
  };

  useEffect(() => {
    getEntityLineage();
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes],
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges],
  );
  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
  );

  const fitViewOptions: FitViewOptions = {
    padding: 0.2,
  };

  const defaultEdgeOptions: DefaultEdgeOptions = {
    animated: true,
  };


  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Lineage</h1>
        <br />
        <h3>Entity {entityType}.{entityId}</h3>
        <div style={{ width: "100vw", height: "100vh" }}>
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
          />
        </div>
      </div>
    </div>
  );
};

export default Lineage;
