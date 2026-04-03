import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { InformationTagDto, CreateInformationTagDto } from '../api/adminTypes';

export function useInformationTags() {
  const [tags, setTags] = useState<InformationTagDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.tags.getAll();
      setTags(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch tags';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(
    async (dto: CreateInformationTagDto) => {
      try {
        await adminApi.tags.create(dto);
        showSuccess('Tag created successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to create tag';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const update = useCallback(
    async (id: string, dto: Partial<CreateInformationTagDto>) => {
      try {
        await adminApi.tags.update(id, dto);
        showSuccess('Tag updated successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to update tag';
        showError(message);
        throw err;
      }
    },
    [fetchAll]
  );

  const deleteTag = useCallback(
    async (id: string) => {
      try {
        await adminApi.tags.delete(id);
        showSuccess('Tag deleted successfully');
        await fetchAll();
      } catch (err: any) {
        const message = err.response?.data?.error || 'Failed to delete tag';
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
    tags,
    loading,
    error,
    create,
    update,
    delete: deleteTag,
    refresh: fetchAll,
  };
}
