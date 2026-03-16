import React from 'react';
import { useAdminLogs } from '../../services/admin-service/hooks/useAdminLogs';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { MdHistory, MdRefresh } from 'react-icons/md';
import type { AdminLogDto } from '../../services/admin-service/api/adminTypes';

const AdminLogs: React.FC = () => {
  const { logs, loading, refresh } = useAdminLogs();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionVariant = (actionCode: string): 'success' | 'warning' | 'danger' | 'info' => {
    if (actionCode.includes('CREATE')) return 'success';
    if (actionCode.includes('UPDATE')) return 'info';
    if (actionCode.includes('DELETE')) return 'danger';
    return 'default';
  };

  const columns: Column<AdminLogDto>[] = [
    {
      label: 'Timestamp',
      key: 'creationTime',
      render: (value: string) => formatDate(value),
    },
    {
      label: 'Action',
      key: 'actionCode',
      render: (value: string) => (
        <Badge variant={getActionVariant(value)} size="small">
          {value}
        </Badge>
      ),
    },
    { label: 'Entity Type', key: 'entityType' },
    {
      label: 'Entity ID',
      key: 'targetedEntityId',
      render: (value: string | undefined) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {value?.substring(0, 8) || '-'}
        </span>
      ),
    },
    { label: 'Description', key: 'description' },
    {
      label: 'Administrator',
      key: 'administratorId',
      render: (value: string) => (
        <span style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
          {value.substring(0, 8)}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Admin Logs</h1>
        <Button variant="outline" icon={MdRefresh} onClick={() => refresh()}>
          Refresh
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        loading={loading}
        emptyMessage="No admin logs found"
        emptyIcon={MdHistory}
        getRowKey={(log) => log.id}
      />
    </div>
  );
};

export default AdminLogs;
