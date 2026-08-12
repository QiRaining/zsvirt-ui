import type { OperationLongjobStatus } from "@zstack/zsphere-types";
import { OperationStatus as IStatus } from "@zstack/zsphere-types";
import type { OperationLog } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import { useEffect, useRef, useState, useCallback } from "react";
import useCountDown from "react-countdown-hook";

import { getAllLongjobs } from "../../action/validators";
import { useZsvResume } from "../../use-zsv-resume";

dayjs.extend(duration);
dayjs.extend(utc);

export const useUploadImageCountDown = (
  operationLog?: OperationLog,
  longJobState?: OperationLongjobStatus,
) => {
  const [countDown, setCountDown] = useState<string>("");
  const initialTime = useRef<number>(0);
  const [timeLeft, { start, pause, reset }] = useCountDown(
    initialTime.current,
    1000,
  );
  const [current, setCurrent] = useState<any>();
  const resume = useZsvResume();
  const currentLongjob = operationLog
    ? getAllLongjobs(operationLog)?.[0]
    : undefined;

  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // react-countdown-hook 没有 stop 方法，使用 pause + reset 模拟
  const stop = useCallback(() => {
    pause();
    reset();
  }, [pause, reset]);

  useEffect(() => {
    const running: boolean = operationLog?.status === IStatus.Running;
    if (timeLeft > 0 && running) {
      const dur = dayjs.duration(Math.ceil(timeLeft), "milliseconds");
      const formal = dayjs.utc(dur.asMilliseconds()).format("HH:mm:ss");
      setCountDown(formal);
    } else {
      setCountDown(`-`);
    }
  }, [timeLeft, operationLog]);

  useEffect(() => {
    const clearTimer = () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current);
        timerIdRef.current = null;
      }
    };

    if (current) {
      const runPolling = () => {
        clearTimer();

        const remain = current?.remainTime() || 0;
        if (remain > 0) {
          start(remain);
        }

        if (!current?.complete) {
          timerIdRef.current = setTimeout(runPolling, 5000);
        }
      };

      runPolling();
    } else {
      stop();
      clearTimer();
    }

    return () => clearTimer();
  }, [start, stop, current, longJobState]);

  useEffect(() => {
    const logId = currentLongjob?.longJobUuid;
    if (operationLog && current?.jobId !== logId) {
      setCurrent(resume(operationLog)?.getFile());
    }
  }, [operationLog, resume, current?.jobId, currentLongjob?.longJobUuid]);

  return {
    countDown,
  };
};
