import type { QueryResult } from "@apollo/client";
import { useCallback, useEffect, useState, useRef } from "react";

interface IProps extends Pick<QueryResult, "loading" | "refetch"> {
  wait?: number;
}

// 自定义防抖 hook
function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  options: { wait: number },
) {
  const timerRef = useRef<NodeJS.Timeout>();

  const run = useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        fn(...args);
      }, options.wait);
    },
    [fn, options.wait],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { run };
}

// 处理 apollo 调用 refetch 时 loading 不变化问题，默认最少600ms
export function useLoading({ loading, refetch, wait = 600 }: IProps) {
  const [innerLoading, setInnerLoading] = useState(false);

  const wrapperRefetch: typeof refetch = useCallback(
    (...args) => {
      setInnerLoading(true);
      return refetch(...args);
    },
    [refetch],
  );

  const { run } = useDebounceFn(
    () => {
      setInnerLoading(false);
    },
    {
      wait,
    },
  );

  useEffect(() => {
    if (innerLoading) {
      run();
    }
  }, [innerLoading, run]);

  return {
    loading: loading || innerLoading,
    refetch: wrapperRefetch,
  };
}
