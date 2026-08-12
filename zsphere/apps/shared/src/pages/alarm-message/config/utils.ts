import { secToTime } from "@zstack/zsphere-utils";
import { useIntl } from "react-intl";

export const useFormatTime = () => {
  const intl = useIntl();
  return (s: number) => {
    const time = secToTime(s);
    let str = "";
    if (time.day > 0) {
      str +=
        time.day +
        intl.formatMessage({
          id: "day",
          defaultMessage: "days",
        });
    }
    if (time.hour > 0) {
      str +=
        time.hour +
        intl.formatMessage({
          id: "hours",
          defaultMessage: "hours",
        });
    }
    if (time.minute > 0) {
      str +=
        time.minute +
        intl.formatMessage({
          id: "minites",
          defaultMessage: "Minutes",
        });
    }
    if (time.second > 0) {
      str +=
        time.second +
        intl.formatMessage({
          id: "second",
          defaultMessage: " seconds",
        });
    }
    if (
      time.day === 0 &&
      time.hour === 0 &&
      time.minute === 0 &&
      time.second === 0
    ) {
      str =
        0 +
        intl.formatMessage({
          id: "second",
          defaultMessage: " seconds",
        });
    }
    return str;
  };
};
