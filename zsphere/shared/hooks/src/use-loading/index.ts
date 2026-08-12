import type { QueryResult } from "@apollo/client";
import { useDebounceFn } from "ahooks";
import { useCallback, useEffect, useState } from "react";

interface IProps extends Pick<QueryResult, "loading" | "refetch"> {
  wait?: number;
}

// 处理 apollo 调用 refetch 时 loading 不变化问题，默认最少600ms
function useLoading({ loading, refetch, wait = 600 }: IProps) {
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

export default useLoading;
