import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
// TimeProvider.tsx
import React, { createContext, useContext } from "react";

import type { ServerTimeData } from "./use-server-time";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

interface TimeContextType extends ServerTimeData {}

const TimeContext = createContext<TimeContextType | null>(null);

interface TimeProviderProps {
  children: React.ReactNode;
  serverTime: ServerTimeData;
}

export const TimeProvider = ({ children, serverTime }: TimeProviderProps) => {
  return (
    <TimeContext.Provider value={serverTime}>{children}</TimeContext.Provider>
  );
};

export const useTime = () => {
  const context = useContext(TimeContext);
  // if (!context) {
  //   throw new Error("useTime must be used within a TimeProvider");
  // }
  if (!context) {
    console.error("useTime must be used within a TimeProvider");
  }

  const { millionSecondsGap, timezone } = context || {
    millionSecondsGap: 0,
    timezone: "Asia/Shanghai",
  };

  const getCurrentServerTimeMillionSeconds = () => {
    return Date.now() - millionSecondsGap;
  };

  const postClientTime = (datetime?: dayjs.ConfigType) => {
    return timezone ? dayjs(datetime).tz(timezone) : dayjs(datetime);
  };

  const getServerTime = (datetime?: dayjs.ConfigType) => {
    if (!timezone || !datetime || typeof datetime === "number") {
      return dayjs(datetime);
    }

    if (typeof datetime === "string" && !Number.isNaN(Number(datetime))) {
      return dayjs(+datetime);
    }

    if (
      dayjs.isDayjs(datetime) &&
      datetime.utcOffset() === dayjs().utcOffset()
    ) {
      return datetime;
    }

    return dayjs(datetime).add(
      dayjs().utcOffset() - dayjs(datetime).tz(timezone).utcOffset(),
      "minute",
    );
  };

  const getDurationTime = (dataTime?: dayjs.ConfigType) => {
    if (!dataTime) {
      return dayjs.duration(0);
    }
    const dataMoment = getServerTime(dataTime);
    const currentMoment = getServerTime(getCurrentServerTimeMillionSeconds());
    return dayjs.duration(currentMoment.diff(dataMoment));
  };

  return {
    postClientTime,
    getServerTime,
    getDurationTime,
    getCurrentServerTimeMillionSeconds,
  };
};
