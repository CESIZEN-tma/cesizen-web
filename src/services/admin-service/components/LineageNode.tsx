import { useState } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { LineageEvent } from '../api/adminTypes';
import './css/lineage-node.css';

const LineageNode: React.FC<NodeProps> = ({ data }) => {
  const event = data as unknown as LineageEvent & { isLast: boolean };
  const [expanded, setExpanded] = useState(false);

  const formattedDate = new Date(event.occurredAt).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="lineage-node" onClick={() => setExpanded(!expanded)}>
      {event.step !== 1 && <Handle type="target" position={Position.Left} />}

      <div className="lineage-node-action">{event.actionCode}</div>
      <div className="lineage-node-date">{formattedDate}</div>

      {expanded && (
        <div className="lineage-node-details">
          <div className="lineage-node-details-row">
            <b>Description:</b>
            <span>{event.description}</span>
          </div>
          <div className="lineage-node-details-row">
            <b>Administrator:</b>
            <span>{event.administratorName}</span>
          </div>
          <div className="lineage-node-details-row">
            <b>Email:</b>
            <span>{event.administratorEmail}</span>
          </div>
          <div className="lineage-node-log-id">Log ID: {event.logId}</div>
        </div>
      )}

      {!event.isLast && <Handle type="source" position={Position.Right} />}
    </div>
  );
};

export default LineageNode;
