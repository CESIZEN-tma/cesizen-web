import { useState, useCallback, useEffect } from 'react';
import { adminApi } from '../api/adminApi';
import { showSuccess, showError } from '../../../shared/configs/toastConfig';
import type { QuizzDto, CreateQuizzDto } from '../api/adminTypes';

export function useQuizzes() {
  const [quizzes, setQuizzes] = useState<QuizzDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminApi.quizzes.getAll();
      setQuizzes(response.data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch quizzes';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchById = useCallback(async (id: string): Promise<QuizzDto | null> => {
    try {
      const response = await adminApi.quizzes.getById(id);
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to fetch quiz details';
      showError(message);
      return null;
    }
  }, []);

  const create = useCallback(async (dto: CreateQuizzDto) => {
    try {
      await adminApi.quizzes.create(dto);
      showSuccess('Quiz created successfully');
      await fetchAll();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to create quiz';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  const update = useCallback(async (id: string, dto: Partial<CreateQuizzDto>) => {
    try {
      await adminApi.quizzes.update(id, dto);
      showSuccess('Quiz updated successfully');
      await fetchAll();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to update quiz';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  const deleteQuiz = useCallback(async (id: string) => {
    try {
      await adminApi.quizzes.delete(id);
      showSuccess('Quiz deleted successfully');
      await fetchAll();
    } catch (err: any) {
      const message = err.response?.data?.error || 'Failed to delete quiz';
      showError(message);
      throw err;
    }
  }, [fetchAll]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    quizzes,
    loading,
    error,
    create,
    update,
    delete: deleteQuiz,
    fetchById,
    refresh: fetchAll,
  };
}
