import { useState, useCallback } from "react";

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  statusCode: number | null;
}

/**
 * Universal React Hook for managing API state, loading, and standardized error codes across all APIs.
 */
export function useApi<T = any>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    statusCode: null,
  });

  const request = useCallback(
    async (apiFn: () => Promise<any>): Promise<{ success: boolean; data?: T; error?: string }> => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await apiFn();

        if (response && response.success === false) {
          const errorMsg = response.error || "Request failed";
          setState({
            data: null,
            loading: false,
            error: errorMsg,
            statusCode: response.statusCode || 400,
          });
          return { success: false, error: errorMsg };
        }

        setState({
          data: response.data || response,
          loading: false,
          error: null,
          statusCode: 200,
        });

        return { success: true, data: response.data || response };
      } catch (err: any) {
        const errorMsg = err.message || "An unexpected error occurred.";
        setState({
          data: null,
          loading: false,
          error: errorMsg,
          statusCode: err.statusCode || 500,
        });
        return { success: false, error: errorMsg };
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      statusCode: null,
    });
  }, []);

  return {
    ...state,
    request,
    reset,
  };
}

export default useApi;
