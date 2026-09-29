import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../services/api";

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs an API call on mount and exposes loading/error state so pages do not
 * each re-implement the same three-state handling.
 */
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  // `fetcher` is intentionally excluded — callers pass their own `deps`
  // to control when the request re-runs.
  const run = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcher();
      setState({ data, loading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        loading: false,
        error:
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }, deps);

  useEffect(() => {
    void run();
  }, [run]);

  return { ...state, refetch: run, setData: (data: T) => setState((p) => ({ ...p, data })) };
}

/** Maps a caught value onto a message safe to show in the UI. */
export const errorMessage = (err: unknown, fallback: string) =>
  err instanceof ApiError ? err.message : fallback;
