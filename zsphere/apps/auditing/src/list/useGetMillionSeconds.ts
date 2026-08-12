import { useLazyQuery } from "@apollo/client";
import { useCallback, useMemo, useRef, useEffect } from "react";

import { getCurrentTime } from "../gql/audit.gql";

export default function useGetMillionSeconds() {
  const mounted = useRef(true);

  const [getMillionSeconds, { loading, data: currentTime, refetch, client }] =
    useLazyQuery(getCurrentTime, {
      fetchPolicy: "no-cache",
    });

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // 取消所有进行中的查询
      client?.stop();
    };
  }, [client]);

  const MillionSeconds = useMemo(() => {
    if (!mounted.current) {
      return null;
    }
    return currentTime?.getCurrentTime?.currentTime?.MillionSeconds;
  }, [currentTime]);

  const _getMillionSeconds = useCallback(() => {
    if (!mounted.current) {
      return;
    }
    if (refetch) {
      refetch();
    } else {
      getMillionSeconds();
    }
  }, [getMillionSeconds, refetch]);

  return {
    MillionSeconds,
    loading,
    getMillionSeconds: _getMillionSeconds,
  };
}
