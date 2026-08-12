import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useState, useCallback, useEffect, useRef } from "react";

dayjs.extend(duration);

// 自定义 useInterval hook 实现
function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // 记住最新的回调函数
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // 设置定时器
  useEffect(() => {
    if (delay !== null) {
      const timer = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(timer);
    }
  }, [delay]);
}

const getPeriod = (startTime?: number, endTime?: number): number => {
  if (!startTime || !endTime) {
    return 3;
  }

  const timeRange = dayjs.duration(dayjs(startTime).diff(dayjs(endTime)));
  if (-timeRange.asYears() >= 1) {
    return 52704;
  }
  if (-timeRange.asWeeks() >= 8) {
    return 8064;
  }
  if (-timeRange.asWeeks() >= 2) {
    return 4464;
  }
  if (-timeRange.asWeeks() >= 1) {
    return 2016;
  }
  if (-timeRange.asDays() >= 1) {
    return 288;
  }
  if (-timeRange.asHours() >= 6) {
    return 72;
  }
  if (-timeRange.asHours() >= 1) {
    return 12;
  }
  return 3;
};

export const useMonitorTime = (
  initialStartTime?: number,
  initialEndTime?: number,
) => {
  const [startTime, setStartTime] = useState(
    initialStartTime || dayjs().subtract(15, "minute").valueOf(),
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
