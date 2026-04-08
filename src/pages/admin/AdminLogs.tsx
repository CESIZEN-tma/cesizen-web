import React, { useMemo, useState } from 'react';
import { MdHistory, MdRefresh, MdAccountTree, MdSearch, MdExpandMore } from 'react-icons/md';
import { useAdminLogs } from '../../services/admin-service/hooks/useAdminLogs';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { Spinner } from '../../shared/components/Spinner';
import { EmptyState } from '../../shared/components/EmptyState';
import LineageModal from '../../services/admin-service/components/LineageModal';
import type { AdminLogDto } from '../../services/admin-service/api/adminTypes';
import './css/admin-logs.css';

interface LogGroup {
  key: string;
  entityType: string;
  entityId: string | undefined;
  logs: AdminLogDto[];
}

const AdminLogs: React.FC = () => {
  const { logs, loading, refresh } = useAdminLogs();
  const [lineageTarget, setLineageTarget] = useState<{ entityType: string; entityId: string } | null>(null);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const getActionVariant = (actionCode: string): 'success' | 'warning' | 'danger' | 'info' => {
    if (actionCode.includes('CREATE')) return 'success';
    if (actionCode.includes('UPDATE')) return 'info';
    if (actionCode.includes('DELETE')) return 'danger';
    return 'warning';
  };

  const groups = useMemo<LogGroup[]>(() => {
    const map = new Map<string, AdminLogDto[]>();

    for (const log of logs) {
      const key = log.targetedEntityId
        ? `${log.entityType}::${log.targetedEntityId}`
        : `orphan::${log.id}`;
      const existing = map.get(key) ?? [];
      existing.push(log);
      map.set(key, existing);
    }

    return Array.from(map.entries())
      .map(([key, groupLogs]) => {
        const sorted = [...groupLogs].sort(
          (a, b) => new Date(b.creationTime).getTime() - new Date(a.creationTime).getTime()
        );
        return {
          key,
          entityType: sorted[0].entityType,
          entityId: sorted[0].targetedEntityId,
          logs: sorted,
        };
      })
      .sort((a, b) =>
        new Date(b.logs[0].creationTime).getTime() - new Date(a.logs[0].creationTime).getTime()
      );
  }, [logs]);

  const filteredGroups = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return groups;
    return groups.filter((g) =>
      g.logs.some((log) =>
        [log.actionCode, log.entityType, log.targetedEntityId ?? '', log.description, log.administratorId]
          .some((field) => field.toLowerCase().includes(trimmed))
      )
    );
  }, [groups, query]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  if (loading) return <div className="admin-page"><Spinner size="large" /></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Admin Logs</h1>
        <Button variant="outline" icon={MdRefresh} onClick={() => refresh()}>
          Refresh
        </Button>
      </div>

      {logs.length === 0 ? (
        <EmptyState icon={MdHistory} message="No admin logs found" />
      ) : (
        <>
          <div className="admin-logs-search">
            <MdSearch className="admin-logs-search-icon" />
            <input
              type="text"
              className="admin-logs-search-input"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className="admin-logs-table-wrapper">
            <table className="admin-logs-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Entity Type</th>
                  <th>Entity ID</th>
                  <th>Description</th>
                  <th>Administrator</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="admin-logs-empty">
                      No results for &ldquo;{query}&rdquo;
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group) => {
                    const isMulti = group.logs.length > 1;
                    const latest = group.logs[0];
                    const isExpanded = expandedGroups.has(group.key);

                    if (!isMulti) {
                      return (
                        <tr key={group.key} className="admin-logs-row">
                          <td>{formatDate(latest.creationTime)}</td>
                          <td>
                            <Badge variant={getActionVariant(latest.actionCode)} size="small">
                              {latest.actionCode}
                            </Badge>
                          </td>
                          <td>{latest.entityType}</td>
                          <td>
                            <span className="admin-logs-mono">
                              {latest.targetedEntityId?.substring(0, 8) ?? '-'}
                            </span>
                          </td>
                          <td>{latest.description}</td>
                          <td>
                            <span className="admin-logs-mono">
                              {latest.administratorId.substring(0, 8)}
                            </span>
                          </td>
                          <td />
                        </tr>
                      );
                    }

                    return (
                      <React.Fragment key={group.key}>
                        <tr
                          className={`admin-logs-group-header${isExpanded ? ' admin-logs-group-header--expanded' : ''}`}
                          onClick={() => toggleGroup(group.key)}
                        >
                          <td>{formatDate(latest.creationTime)}</td>
                          <td>
                            <Badge variant={getActionVariant(latest.actionCode)} size="small">
                              {latest.actionCode}
                            </Badge>
                          </td>
                          <td>{latest.entityType}</td>
                          <td>
                            <span className="admin-logs-mono">
                              {latest.targetedEntityId?.substring(0, 8) ?? '-'}
                            </span>
                          </td>
                          <td>
                            <span className="admin-logs-group-toggle">
                              <MdExpandMore
                                size={18}
                                className={`admin-logs-group-chevron${isExpanded ? ' admin-logs-group-chevron--open' : ''}`}
                              />
                              {group.logs.length} events
                            </span>
                          </td>
                          <td>
                            <span className="admin-logs-mono">
                              {latest.administratorId.substring(0, 8)}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            {group.entityId && (
                              <div className="admin-logs-actions">
                                <Button
                                  variant="outline"
                                  size="small"
                                  icon={MdAccountTree}
                                  onClick={() =>
                                    setLineageTarget({
                                      entityType: group.entityType,
                                      entityId: group.entityId!,
                                    })
                                  }
                                >
                                  Lineage
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>

                        {isExpanded &&
                          group.logs.map((log) => (
                            <tr key={log.id} className="admin-logs-subrow">
                              <td>{formatDate(log.creationTime)}</td>
                              <td>
                                <Badge variant={getActionVariant(log.actionCode)} size="small">
                                  {log.actionCode}
                                </Badge>
                              </td>
                              <td>{log.entityType}</td>
                              <td>
                                <span className="admin-logs-mono">
                                  {log.targetedEntityId?.substring(0, 8) ?? '-'}
                                </span>
                              </td>
                              <td>{log.description}</td>
                              <td>
                                <span className="admin-logs-mono">
                                  {log.administratorId.substring(0, 8)}
                                </span>
                              </td>
                              <td />
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {lineageTarget && (
        <LineageModal
          isOpen={!!lineageTarget}
          onClose={() => setLineageTarget(null)}
          entityType={lineageTarget.entityType}
          entityId={lineageTarget.entityId}
        />
      )}
    </div>
  );
};

export default AdminLogs;
