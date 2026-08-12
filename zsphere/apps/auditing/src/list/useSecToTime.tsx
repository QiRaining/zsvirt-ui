import { useIntl } from "react-intl";

function secToTime(s: number) {
  let time = {
    hour: 0,
    minute: 0,
    second: 0,
  };
  if (s > 0) {
    const hour = Math.floor(s / 3600);
    const minute = Math.floor(s / 60) % 60;
    const second = s % 60;
    time = {
      hour,
      minute,
      second,
    };
  }
  return time;
}

const useSecToTime = () => {
  const intl = useIntl();

  return {
    transferSecToTime: (ms: number) => {
      if (ms < 60 * 1000) {
        const s =
          (ms / 1000).toFixed(2) === "0.00" ? "0.01" : (ms / 1000).toFixed(2);
        return `${s} ${intl.formatMessage({
          id: "second",
          defaultMessage: " seconds",
        })}`;
      }
      let str = "";
      const time = secToTime(Math.round(ms / 1000));
      if (time.hour > 0) {
        str += `${time.hour} ${intl.formatMessage({
          id: "hour",
          defaultMessage: "hours",
        })}`;
      }
      if (time.minute > 0) {
        str += `${time.minute} ${intl.formatMessage({
          id: "minite",
          defaultMessage: "minutes",
        })}`;
      }
      if (time.second > 0) {
        str += ` ${time.second} ${intl.formatMessage({
          id: "second",
          defaultMessage: " seconds",
        })}`;
      }
      if (time.hour === 0 && time.minute === 0 && time.second === 0) {
        str = `${0} ${intl.formatMessage({
          id: "second",
          defaultMessage: " seconds",
        })}`;
      }
      return str;
    },
  };
};

export default useSecToTime;
