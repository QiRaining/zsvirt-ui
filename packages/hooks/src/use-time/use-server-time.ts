import { gql, useLazyQuery } from "@apollo/client";
// useServerTime.ts
import { useState, useCallback, useEffect } from "react";

const GET_CURRENT_TIME = gql`
  query getCurrentTime {
    getCurrentTime {
      currentTime {
        MillionSeconds
        Seconds
      }
      timezone
      offset
    }
  }
`;

export interface ServerTimeData {
  millionSecondsGap: number;
  timezone: string;
}

export function useServerTime() {
  const [timeData, setTimeData] = useState<ServerTimeData>({
    millionSecondsGap: 0,
    timezone: "",
  });

  const [fetchServerTime, { refetch }] = useLazyQuery(GET_CURRENT_TIME, {
    onCompleted(data) {
      const now = Date.now();
      const millionSecondsGap =
        now - (data?.getCurrentTime?.currentTime?.MillionSeconds ?? now);
      let timezone = data?.getCurrentTime?.timezone ?? "";
      if (timezone === "Asia/Beijing") {
        timezone = "Asia/Shanghai";
      }
      setTimeData({ millionSecondsGap, timezone });
    },
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    fetchServerTime();
  }, []);

  const refetchServerTime = useCallback(() => {
    refetch?.();
  }, [refetch]);

  return {
    ...timeData,
    refetchServerTime,
  };
}
