import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { GetUserDto, SessionInfoDto } from '../api/adminTypes';

export function useUsers() {
  const [users, setUsers] = useState<GetUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.users.getAll();
      setUsers(response.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to fetch users';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (userId: string, active: boolean) => {
      try {
        await adminApi.users.updateStatus(userId, active);
        showSuccess(`User ${active ? 'activated' : 'deactivated'} successfully`);
        await fetchAll();
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update user status';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const getUserSessions = useCallback(async (userId: string): Promise<SessionInfoDto[]> => {
    try {
      const response = await adminApi.users.getSessions(userId);
      return response.data;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to fetch user sessions';
      showError(message);
      throw err;
    }
  }, []);

  const revokeSession = useCallback(
    async (userId: string, sessionId: string) => {
      try {
        await adminApi.users.revokeSession(userId, sessionId);
        showSuccess('Session revoked successfully');
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to revoke session';
        showError(message);
        throw err;
      }
    },
    []
  );

  const revokeAllSessions = useCallback(
    async (userId: string) => {
      try {
        await adminApi.users.revokeAllSessions(userId);
        showSuccess('All user sessions revoked successfully');
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to revoke all sessions';
        showError(message);
        throw err;
      }
    },
    []
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    users,
    loading,
    error,
    updateStatus,
    getUserSessions,
    revokeSession,
    revokeAllSessions,
    refresh: fetchAll,
  };
}
