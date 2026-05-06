import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { InformationPageDto, CreateInformationPageDto } from '../api/adminTypes';

export function useInformationPages() {
  const [pages, setPages] = useState<InformationPageDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.pages.getAll();
      setPages(response.data);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to fetch information pages';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (dto: CreateInformationPageDto) => {
    try {
      await adminApi.pages.create(dto);
      showSuccess('Information page created successfully');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create information page';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  const update = useCallback(async (id: string, dto: Partial<CreateInformationPageDto>) => {
    try {
      await adminApi.pages.update(id, dto);
      showSuccess('Information page updated successfully');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update information page';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  const deletePage = useCallback(async (id: string) => {
    try {
      await adminApi.pages.delete(id);
      showSuccess('Information page deleted successfully');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete information page';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    pages,
    loading,
    error,
    create,
    update,
    delete: deletePage,
    refresh: fetchAll,
  };
}
