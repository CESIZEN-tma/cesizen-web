import { useState } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LineageEvent } from "../api/adminTypes";


const LineageNode: React.FC<NodeProps> = ({ data }) => {
  const event = data as unknown as LineageEvent & { isLast: boolean };
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(event.occurredAt).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div onClick={() => setExpanded(!expanded)} style={{
      padding: '8px 12px', background: 'white', border: '1px solid #ccc',
      borderRadius: 6, cursor: 'pointer', minWidth: 200, userSelect: 'none',
    }}>
      {event.step !== 1 && <Handle type="target" position={Position.Left} />}

      <strong>{event.actionCode}</strong>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{formattedDate}</div>

      {expanded && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #eee', fontSize: 12, color: '#444' }}>
          <div><b>Description :</b> {event.description}</div>
          <div style={{ marginTop: 4 }}><b>Administrateur :</b> {event.administratorName}</div>
          <div><b>Email :</b> {event.administratorEmail}</div>
          <div style={{ marginTop: 4, color: '#888' }}>Log ID : {event.logId}</div>
        </div>
      )}

      {!event.isLast && <Handle type="source" position={Position.Right} />}
    </div>
  );
};

export default LineageNode;