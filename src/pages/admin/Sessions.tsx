import React, { useState } from 'react';
import { useAdminSessions } from '../../services/admin-service/hooks/useAdminSessions';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { MdDevices, MdDelete, MdDeleteSweep } from 'react-icons/md';
import type { SessionInfoDto } from '../../services/admin-service/api/adminTypes';

const Sessions: React.FC = () => {
  const { sessions, loading, revoke, revokeAll } = useAdminSessions();
  const [selectedSession, setSelectedSession] = useState<SessionInfoDto | null>(null);
  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false);
  const [isRevokeAllDialogOpen, setIsRevokeAllDialogOpen] = useState(false);

  const handleRevoke = async () => {
    if (!selectedSession) return;
    try {
      await revoke(selectedSession.id);
      setIsRevokeDialogOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAll();
      setIsRevokeAllDialogOpen(false);
    } catch (err) {
      // Error handled by hook
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  const columns: Column<SessionInfoDto>[] = [
    {
      label: 'Session ID',
      key: 'id',
      render: (value: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {value.substring(0, 16)}...
        </span>
      ),
    },
    {
      label: 'Created',
      key: 'creationTime',
      render: (value: string) => formatDate(value),
    },
    {
      label: 'Expires',
      key: 'expiresAt',
      render: (value: string) => formatDate(value),
    },
    {
      label: 'Status',
      key: 'consumed',
      render: (value: boolean, row: SessionInfoDto) => {
        if (value) return <Badge variant="default">Consumed</Badge>;
        if (isExpired(row.expiresAt)) return <Badge variant="warning">Expired</Badge>;
        return <Badge variant="success">Active</Badge>;
      },
    },
  ];

  const activeSessions = sessions.filter(s => !s.consumed && !isExpired(s.expiresAt));

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Admin Sessions</h1>
        {activeSessions.length > 1 && (
          <Button
            variant="danger"
            icon={MdDeleteSweep}
            onClick={() => setIsRevokeAllDialogOpen(true)}
          >
            Revoke All Other Sessions
          </Button>
        )}
      </div>

      <DataTable
        columns={columns}
        data={sessions}
        loading={loading}
        emptyMessage="No admin sessions found"
        emptyIcon={MdDevices}
        getRowKey={(session) => session.id}
        actions={(session) => (
          <Button
            variant="danger"
            size="small"
            icon={MdDelete}
            onClick={() => {
              setSelectedSession(session);
              setIsRevokeDialogOpen(true);
            }}
            disabled={session.consumed || isExpired(session.expiresAt)}
          >
            Revoke
          </Button>
        )}
      />

      {/* Revoke Single Session Confirmation */}
      <ConfirmDialog
        isOpen={isRevokeDialogOpen}
        title="Revoke Session"
        message={`Are you sure you want to revoke this session? If it's your current session, you will be logged out.`}
        confirmText="Revoke"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleRevoke}
        onCancel={() => setIsRevokeDialogOpen(false)}
      />

      {/* Revoke All Confirmation */}
      <ConfirmDialog
        isOpen={isRevokeAllDialogOpen}
        title="Revoke All Other Sessions"
        message="Are you sure you want to revoke all other admin sessions? This will log out all other devices except the current one."
        confirmText="Revoke All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleRevokeAll}
        onCancel={() => setIsRevokeAllDialogOpen(false)}
      />
    </div>
  );
};

export default Sessions;
