import { useInterval } from "ahooks";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useState, useCallback, useEffect } from "react";

dayjs.extend(duration);

const getPeriod = (startTime?: number, endTime?: number): number => {
  if (!startTime || !endTime) {
    return 3;
  }

  const diffMs = dayjs(startTime).diff(dayjs(endTime));
  const dur = dayjs.duration(diffMs);
  const yearsDiff = -dur.asYears();
  const weeksDiff = -dur.asWeeks();
  const daysDiff = -dur.asDays();
  const hoursDiff = -dur.asHours();

  if (yearsDiff >= 1) {
    return 52704;
  }
  if (weeksDiff >= 8) {
    return 8064;
  }
  if (weeksDiff >= 2) {
    return 4464;
  }
  if (weeksDiff >= 1) {
    return 2016;
  }
  if (daysDiff >= 1) {
    return 288;
  }
  if (hoursDiff >= 6) {
    return 72;
  }
  if (hoursDiff >= 1) {
    return 12;
  }
  return 3;
};

const useTime = (initialStartTime?: number, initialEndTime?: number) => {
  const [startTime, setStartTime] = useState(
    initialStartTime || dayjs().subtract(15, "m").valueOf(),
  );
  const [endTime, setEndTime] = useState(initialEndTime || dayjs().valueOf());
  const [interval, setInterval] = useState<number | null>(null);
  const period = getPeriod(startTime, endTime);

  useEffect(() => {
    if (initialStartTime) {
      setStartTime(initialStartTime);
    }
  }, [initialStartTime]);

  useEffect(() => {
    if (initialEndTime) {
      setEndTime(initialEndTime);
    }
  }, [initialEndTime]);

  const startInterval = useCallback(() => {
    // 最快12秒更新一次
    let _interval = 12000;
    if (period > 12) {
      _interval = period * 1000;
    }
    setInterval(_interval);
  }, [period]);

  const stopInterval = () => {
    setInterval(null);
  };

  useEffect(() => {
    startInterval();
  }, [period]);

  const intervalHandler = useCallback(() => {
    if (interval) {
      setStartTime((prevTime) => prevTime + interval);
      setEndTime((prevTime) => prevTime + interval);
    }
  }, [interval]);

  useInterval(intervalHandler, interval);

  return { startTime, endTime, period, startInterval, stopInterval };
};

export default useTime;
