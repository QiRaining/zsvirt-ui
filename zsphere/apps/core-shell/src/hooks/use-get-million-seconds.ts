import { gql, useLazyQuery } from "@apollo/client";
import { useMemo, useCallback } from "react";

const GET_CURRENT_TIME = gql`
  query getCurrentTime {
    getCurrentTime {
      currentTime {
        Seconds
        MillionSeconds
      }
    }
  }
`;

export default function useGetMillionSeconds() {
  const [getMillionSeconds, { loading, data: currentTime, refetch }] =
    useLazyQuery(GET_CURRENT_TIME, {
      fetchPolicy: "no-cache",
    });
  const MillionSeconds = useMemo(() => {
    return currentTime?.getCurrentTime?.currentTime?.MillionSeconds;
  }, [currentTime]);

  const _getMillionSeconds = useCallback(() => {
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
