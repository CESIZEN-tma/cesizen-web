import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showError } from '../../../shared/configs/toastConfig';
import type { AdminLogDto } from '../api/adminTypes';

export function useAdminLogs() {
  const [logs, setLogs] = useState<AdminLogDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (filters?: Record<string, string>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.logs.getAll(filters);
      setLogs(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch admin logs';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

const fetchEntityLineage = useCallback(async (entityType: string, entityId: string) => {
  setLoading(true);
  try {
    const response = await adminApi.logs.getEntityLineage(entityType, entityId);
    return response.data; 
  } catch (err: any) {
    const message = err.response?.data?.error || 'Failed to fetch entity lineage';
    setError(message);
    showError(message);
  } finally {
    setLoading(false);
  }
}, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    logs,
    loading,
    error,
    refresh: fetchAll,
    fetchEntityLineage,
  };
}
