/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successMessage?: string;
}

export function useApi<T = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (
      apiCall: () => Promise<any>,
      options: UseApiOptions<T> = {}
    ) => {
      const {
        onSuccess,
        onError,
        showSuccessToast = false,
        showErrorToast = true,
        successMessage,
      } = options;

      try {
        setLoading(true);
        setError(null);

        const response = await apiCall();
        
        setData(response.data);

        if (showSuccessToast) {
          toast.success(successMessage || response.data?.message || 'Operation successful');
        }

        onSuccess?.(response.data);
        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.msg || err.message || 'An error occurred';
        setError(errorMessage);

        if (showErrorToast) {
          toast.error(errorMessage);
        }

        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    error,
    execute,
    setData,
  };
}

export function usePaginatedApi<T = any>() {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
  });

  const fetchData = useCallback(
    async (
      apiCall: (params: any) => Promise<any>,
      params: any = {}
    ) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiCall({
          page: pagination.page,
          limit: pagination.limit,
          ...params,
        });

        setData(response.data.data || []);
        setPagination({
          page: response.data.page || 1,
          limit: response.data.limit || 10,
          total: response.data.total || 0,
          pages: response.data.pages || 1,
        });

        return response.data;
      } catch (err: any) {
        const errorMessage = err.response?.data?.msg || err.message || 'Failed to fetch data';
        setError(errorMessage);
        toast.error(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pagination.page, pagination.limit]
  );

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setLimit = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    data,
    loading,
    error,
    pagination,
    fetchData,
    setPage,
    setLimit,
    setData,
  };
}