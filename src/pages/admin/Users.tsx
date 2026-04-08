import React, { useState } from 'react';
import { useUsers } from '../../services/admin-service/hooks/useUsers';
import { DataTable, type Column } from '../../shared/components/DataTable';
import { Modal } from '../../shared/components/Modal';
import { ConfirmDialog } from '../../shared/components/ConfirmDialog';
import { Button } from '../../shared/components/Button';
import { Badge } from '../../shared/components/Badge';
import { Spinner } from '../../shared/components/Spinner';
import { MdPeople, MdDevices, MdBlock, MdCheckCircle, MdInfo } from 'react-icons/md';
import type { GetUserDto, SessionInfoDto } from '../../services/admin-service/api/adminTypes';

const Users: React.FC = () => {
  const { users, loading, updateStatus, getUserSessions, revokeSession, revokeAllSessions } = useUsers();
  const [selectedUser, setSelectedUser] = useState<GetUserDto | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);
  const [isRevokeAllDialogOpen, setIsRevokeAllDialogOpen] = useState(false);
  const [userSessions, setUserSessions] = useState<SessionInfoDto[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  const handleViewDetails = (user: GetUserDto) => {
    setSelectedUser(user);
    setIsDetailsModalOpen(true);
  };

  const handleViewSessions = async (user: GetUserDto) => {
    setSelectedUser(user);
    setIsSessionsModalOpen(true);
    setSessionsLoading(true);
    try {
      const sessions = await getUserSessions(user.id);
      setUserSessions(sessions);
    } catch (err) {
      // Error handled by hook
    } finally {
      setSessionsLoading(false);
    }
  };

  const handleToggleStatus = async (user: GetUserDto) => {
    try {
      await updateStatus(user.id, !user.active);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!selectedUser) return;
    try {
      await revokeSession(selectedUser.id, sessionId);
      const updatedSessions = await getUserSessions(selectedUser.id);
      setUserSessions(updatedSessions);
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!selectedUser) return;
    try {
      await revokeAllSessions(selectedUser.id);
      setIsRevokeAllDialogOpen(false);
      setIsSessionsModalOpen(false);
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

  const columns: Column<GetUserDto>[] = [
    { label: 'Email', key: 'email' },
    { label: 'First Name', key: 'firstName' },
    { label: 'Last Name', key: 'lastName' },
    {
      label: 'Member Since',
      key: 'memberSince',
      render: (value: string) => formatDate(value),
      sortable: true,
    },
    {
      label: 'Account',
      key: 'accountActivated',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'warning'}>
          {value ? 'Verified' : 'Pending'}
        </Badge>
      ),
    },
    {
      label: 'Status',
      key: 'active',
      render: (value: boolean) => (
        <Badge variant={value ? 'success' : 'danger'}>
          {value ? 'Active' : 'Disabled'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Users</h1>
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        emptyIcon={MdPeople}
        getRowKey={(user) => user.id}
        actions={(user) => (
          <>
            <Button variant="outline" size="small" icon={MdInfo} onClick={() => handleViewDetails(user)}>
              Details
            </Button>
            <Button variant="outline" size="small" icon={MdDevices} onClick={() => handleViewSessions(user)}>
              Sessions
            </Button>
            <Button
              variant={user.active ? 'warning' : 'success'}
              size="small"
              icon={user.active ? MdBlock : MdCheckCircle}
              onClick={() => handleToggleStatus(user)}
            >
              {user.active ? 'Disable' : 'Enable'}
            </Button>
          </>
        )}
      />

      {/* User Details Modal */}
      <Modal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title="User Details"
        size="medium"
      >
        {selectedUser && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div><strong>Email:</strong> {selectedUser.email}</div>
            <div><strong>Name:</strong> {selectedUser.firstName} {selectedUser.lastName}</div>
            <div><strong>Member Since:</strong> {formatDate(selectedUser.memberSince)}</div>
            <div>
              <strong>Account:</strong>{' '}
              <Badge variant={selectedUser.accountActivated ? 'success' : 'warning'}>
                {selectedUser.accountActivated ? 'Verified' : 'Pending verification'}
              </Badge>
            </div>
            <div>
              <strong>Status:</strong>{' '}
              <Badge variant={selectedUser.active ? 'success' : 'danger'}>
                {selectedUser.active ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            {selectedUser.lockedUntil && (
              <div>
                <strong>Locked until:</strong>{' '}
                <span style={{ color: 'var(--color-danger)' }}>{formatDate(selectedUser.lockedUntil)}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* User Sessions Modal */}
      <Modal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        title={`Sessions - ${selectedUser?.email}`}
        size="large"
        footer={
          userSessions.length > 0 && (
            <Button variant="danger" onClick={() => setIsRevokeAllDialogOpen(true)}>
              Revoke All Sessions
            </Button>
          )
        }
      >
        {sessionsLoading && <Spinner />}

        {!sessionsLoading && userSessions.length === 0 && (
          <p style={{ textAlign: 'center', color: 'var(--color-gray-600)', padding: '20px' }}>
            No active sessions found
          </p>
        )}

        {!sessionsLoading && userSessions.length > 0 && (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Created</th>
                  <th>Expires</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {userSessions.map((session) => (
                  <tr key={session.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                      {session.id.substring(0, 12)}...
                    </td>
                    <td>{formatDate(session.creationTime)}</td>
                    <td>{formatDate(session.expiresAt)}</td>
                    <td>
                      <Badge variant={session.consumed ? 'default' : 'success'}>
                        {session.consumed ? 'Consumed' : 'Active'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="small"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={session.consumed}
                      >
                        Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Revoke All Confirmation */}
      <ConfirmDialog
        isOpen={isRevokeAllDialogOpen}
        title="Revoke All Sessions"
        message={`Are you sure you want to revoke all sessions for ${selectedUser?.email}? The user will be logged out from all devices.`}
        confirmText="Revoke All"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleRevokeAllSessions}
        onCancel={() => setIsRevokeAllDialogOpen(false)}
      />
    </div>
  );
};

export default Users;
