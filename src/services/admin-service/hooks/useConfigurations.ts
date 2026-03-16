import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { ConfigurationDto, CreateConfigurationDto } from '../api/adminTypes';

export function useConfigurations() {
  const [configurations, setConfigurations] = useState<ConfigurationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.configurations.getAll();
      setConfigurations(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch configurations';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (dto: CreateConfigurationDto) => {
      try {
        await adminApi.configurations.create(dto);
        showSuccess('Configuration created successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to create configuration';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const update = useCallback(
    async (id: string, dto: Partial<CreateConfigurationDto>) => {
      try {
        await adminApi.configurations.update(id, dto);
        showSuccess('Configuration updated successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to update configuration';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const deleteConfig = useCallback(
    async (id: string) => {
      try {
        await adminApi.configurations.delete(id);
        showSuccess('Configuration deleted successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to delete configuration';
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
    configurations,
    loading,
    error,
    create,
    update,
    delete: deleteConfig,
    refresh: fetchAll,
  };
}
