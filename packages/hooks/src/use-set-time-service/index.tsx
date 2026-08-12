import { useEffect } from "react";

import { TimeService } from "./time-service.ts";

export const useSetTimeService = (workerUrl: string) => {
  useEffect(() => {
    // /vendor/time-worker.js
    if (typeof window !== "undefined") {
      const timeWorker = new Worker(workerUrl);
      const timeService = new TimeService(timeWorker);
      timeService.startTimer();
      // @ts-expect-error
      window.timeService = timeService;
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          // @ts-expect-error
          window.timeService.resetTimer();
        }
      });
    }
  }, []);
};
