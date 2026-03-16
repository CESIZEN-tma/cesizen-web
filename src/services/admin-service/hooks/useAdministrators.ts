import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { GetAdministratorDto, CreateAdministratorDto } from '../api/adminTypes';

export function useAdministrators() {
  const [administrators, setAdministrators] = useState<GetAdministratorDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.administrators.getAll();
      setAdministrators(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch administrators';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (dto: CreateAdministratorDto) => {
      try {
        await adminApi.administrators.create(dto);
        showSuccess('Administrator created successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to create administrator';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const update = useCallback(
    async (id: string, dto: Partial<CreateAdministratorDto>) => {
      try {
        await adminApi.administrators.update(id, dto);
        showSuccess('Administrator updated successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to update administrator';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const deleteAdmin = useCallback(
    async (id: string) => {
      try {
        await adminApi.administrators.delete(id);
        showSuccess('Administrator deleted successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to delete administrator';
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
    administrators,
    loading,
    error,
    create,
    update,
    delete: deleteAdmin,
    refresh: fetchAll,
  };
}
