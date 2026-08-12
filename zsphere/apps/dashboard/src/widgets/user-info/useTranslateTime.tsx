import { gql, useQuery } from "@apollo/client";
import type { GetCurrentTime } from "@zstack/zsphere-types/graphql";
import { useInterval } from "ahooks";
import dayjs from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";

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

const useTranslateTime = (initialPlatformTime?: number) => {
  const [time, setTime] = useState(initialPlatformTime ?? Date.now());
  const browserServerTimeDiff = useRef(0);
  const hasServerTime = useRef(false);

  useQuery<{ getCurrentTime: GetCurrentTime }>(GET_CURRENT_TIME, {
    fetchPolicy: "no-cache",
    onCompleted: (result) => {
      const serverTime = result?.getCurrentTime?.currentTime?.MillionSeconds;
      if (typeof serverTime === "number") {
        browserServerTimeDiff.current = Date.now() - serverTime;
        hasServerTime.current = true;
        setTime(serverTime);
      }
    },
  });

  useEffect(() => {
    if (typeof initialPlatformTime === "number") {
      browserServerTimeDiff.current = Date.now() - initialPlatformTime;
      hasServerTime.current = true;
      setTime(initialPlatformTime);
    }
  }, [initialPlatformTime]);

  useInterval(
    () => {
      if (hasServerTime.current) {
        setTime(Date.now() - browserServerTimeDiff.current);
      }
    },
    1000,
    { immediate: true },
  );

  return useMemo(() => {
    return dayjs(time).format("YYYY-MM-DD HH:mm:ss");
  }, [time]);
};

export default useTranslateTime;
