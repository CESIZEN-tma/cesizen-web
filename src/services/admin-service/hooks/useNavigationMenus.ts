import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { NavigationMenuDto, CreateNavigationMenuDto } from '../api/adminTypes';

export function useNavigationMenus() {
  const [menus, setMenus] = useState<NavigationMenuDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.menus.getAll();
      const sorted = response.data.sort((a, b) => a.position - b.position);
      setMenus(sorted);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to fetch navigation menus';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (dto: CreateNavigationMenuDto) => {
    try {
      await adminApi.menus.create(dto);
      showSuccess('Navigation menu created successfully');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to create navigation menu';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  const update = useCallback(async (id: string, dto: Partial<CreateNavigationMenuDto>) => {
    try {
      await adminApi.menus.update(id, dto);
      showSuccess('Navigation menu updated successfully');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update navigation menu';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  const deleteMenu = useCallback(async (id: string) => {
    try {
      await adminApi.menus.delete(id);
      showSuccess('Navigation menu deleted successfully');
      await fetchAll();
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to delete navigation menu';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  const updatePositions = useCallback(async (positions: { id: string; position: number }[]) => {
    try {
      await adminApi.menus.updatePositions(positions);
      await fetchAll();
      showSuccess('Menu order updated successfully');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to update menu positions';
      showError(message);
      await fetchAll();
      throw err;
    }
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    menus,
    loading,
    error,
    create,
    update,
    delete: deleteMenu,
    updatePositions,
    refresh: fetchAll,
  };
}
