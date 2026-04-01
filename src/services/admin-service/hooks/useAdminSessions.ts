import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { SessionInfoDto } from '../api/adminTypes';

export function useAdminSessions() {
  const [sessions, setSessions] = useState<SessionInfoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.sessions.getAll();
      setSessions(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch admin sessions';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const revoke = useCallback(
    async (sessionId: string) => {
      try {
        await adminApi.sessions.revoke(sessionId);
        showSuccess('Session revoked successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to revoke session';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const revokeAll = useCallback(
    async () => {
      try {
        await adminApi.sessions.revokeAll();
        showSuccess('All other sessions revoked successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to revoke all sessions';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    sessions,
    loading,
    error,
    revoke,
    revokeAll,
    refresh: fetchAll,
  };
}
