import { gql, useQuery } from "@apollo/client";
import moment from "moment-timezone";
import { useCallback } from "react";

const getCurrentTime = gql`
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

interface GetCurrentTime {
  timezone?: string;
  offset?: string;
  currentTime?: {
    MillionSeconds?: number;
    Seconds?: number;
  };
}

export function useMoment() {
  const { data: platformTime, refetch: refetchMoment } = useQuery<{
    getCurrentTime: GetCurrentTime;
  }>(getCurrentTime, {
    fetchPolicy: "cache-first",
  });

  let timezone = platformTime?.getCurrentTime?.timezone;
  if (timezone === "Asia/Beijing") {
    timezone = "Asia/Shanghai";
  } // 国产操作系统提过Asia/Beijing时区，但是timezone中不识别
  const currentTime = platformTime?.getCurrentTime.currentTime?.MillionSeconds;

  const postClientTime = useCallback(
    (datetime?: moment.MomentInput) => {
      return timezone ? moment(datetime).tz(timezone!) : moment(datetime);
    },
    [timezone],
  );

  const getServerTime = useCallback(
    (datetime?: moment.MomentInput) => {
      // 时间戳可以使用本地时区正确转换
      if (!timezone || !datetime || typeof datetime === "number") {
        return moment(datetime);
      }

      if (typeof datetime === "string" && !Number.isNaN(Number(datetime))) {
        return moment(+datetime);
      }

      if (
        moment.isMoment(datetime) &&
        datetime?.utcOffset?.() === moment().utcOffset()
      ) {
        return datetime;
      }

      return moment(datetime).add(
        moment().utcOffset() - moment.tz(datetime, timezone).utcOffset(),
        "minutes",
      );
    },
    [timezone],
  );

  const getDurationTime = useCallback(
    (dataTime?: moment.MomentInput) => {
      if (!dataTime || !currentTime) {
        return moment.duration();
      }
      const dataMoment = getServerTime(dataTime);
      const currentMoment = getServerTime(currentTime);
      return moment.duration(currentMoment.diff(dataMoment));
    },
    [currentTime, getServerTime],
  );

  return {
    postClientTime,
    getServerTime,
    getDurationTime,
    currentTime,
    refetchMoment,
  };
}
