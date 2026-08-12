import { gql } from "@apollo/client";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(duration);

declare global {
  interface Window {
    g_main: any;
  }
}

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
export class TimeService {
  private timeWorker: Worker;

  private millionSeconds: number = 0;

  private timeChangeListeners: ((time: number) => void)[] = [];

  private timezone: string = "";

  constructor(timeWorker: Worker) {
    this.timeWorker = timeWorker;
    this.timeWorker.onmessage = (e) => {
      this.millionSeconds = e.data;
      this.notifyTimeChangeListeners();
    };
  }

  getCurrentTime() {
    return this.millionSeconds;
  }

  getTimezone() {
    return this.timezone;
  }

  // 添加时间变化监听器
  addTimeChangeListener(listener: (time: number) => void) {
    this.timeChangeListeners.push(listener);
  }

  startTimer() {
    if (typeof window !== "undefined" && window.g_main?.apolloClient) {
      window.g_main.apolloClient
        .query({
          query: getCurrentTime,
          fetchPolicy: "no-cache",
        })
        // @ts-expect-error
        .then(({ data }) => {
          let _timezone = data?.getCurrentTime?.timezone;
          if (_timezone === "Asia/Beijing") {
            _timezone = "Asia/Shanghai";
          }
          this.timezone = _timezone;
          // 发到worker执行会有两秒的延迟，这边手动续2秒
          this.millionSeconds =
            data?.getCurrentTime.currentTime?.MillionSeconds + 2000;
          this.timeWorker.postMessage({
            op: "start",
            time: this.millionSeconds,
          });
        });
    } else {
      let _timezone = dayjs.tz.guess();
      if (_timezone === "Asia/Beijing") {
        _timezone = "Asia/Shanghai";
      }
      this.timezone = _timezone;
      this.millionSeconds = new Date("2024-04-17").getTime() + 2000;
      this.timeWorker.postMessage({
        op: "start",
        time: this.millionSeconds,
      });
    }
  }

  stopTimer() {
    this.timeWorker.postMessage({ op: "stop" });
  }

  resetTimer() {
    this.stopTimer();
    this.startTimer();
  }

  // 通知所有监听器时间变化
  private notifyTimeChangeListeners() {
    for (const listener of this.timeChangeListeners) {
      listener(this.millionSeconds);
    }
  }
}
