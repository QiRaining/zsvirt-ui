import { Button, RangePicker } from "@zstack/design";
import { useTime } from "@zstack/hooks";
import { Icon } from "@zstack/icon";
import { useInterval } from "ahooks";
import cls from "classnames";
import dayjs from "dayjs";
import {
  forwardRef,
  ForwardRefRenderFunction,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import { useIntl } from "react-intl";

import { Select } from "../a-cloud-old-components";
import { monitorStore } from "./store";
import {
  IBusinessMonitorTimeProps,
  IBusinessMonitorTimeRefs,
  RangeValue,
} from "./type";

import style from "./style.module.less";

type DateRange = { from?: Date; to?: Date } | undefined;

const BusinessMonitorTime: ForwardRefRenderFunction<
  IBusinessMonitorTimeRefs,
  IBusinessMonitorTimeProps
> = (props, ref) => {
  const { disabled, small, onInterval } = props;
  const [type, setType] = useState<string>("15m");
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [customTimeRange, setCustomTimeRange] = useState<RangeValue>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const { getCurrentServerTimeMillionSeconds } = useTime();

  const refetchMoment = () => {
    setCurrentTime(getCurrentServerTimeMillionSeconds());
  };

  useEffect(() => {
    setCurrentTime(getCurrentServerTimeMillionSeconds());
  }, []);

  const {
    setStartTime,
    setEndTime,
    increaseTime,
    interval,
    startInterval,
    stopInterval,
  } = monitorStore();
  const intl = useIntl();

  const options = useMemo(
    () => [
      {
        label: `15 ${intl.formatMessage({ id: "minutes", defaultMessage: "minutes" })}`,
        value: "15m",
      },
      {
        label: `1 ${intl.formatMessage({ id: "hours", defaultMessage: "hours" })}`,
        value: "1h",
      },
      {
        label: `6 ${intl.formatMessage({ id: "hours", defaultMessage: "hours" })}`,
        value: "6h",
      },
      {
        label: `1 ${intl.formatMessage({ id: "days", defaultMessage: "days" })}`,
        value: "1d",
      },
      {
        label: `1 ${intl.formatMessage({ id: "weeks", defaultMessage: "weeks" })}`,
        value: "1w",
      },
      {
        label: `1 ${intl.formatMessage({ id: "months", defaultMessage: "months" })}`,
        value: "1M",
      },
      {
        label: `1 ${intl.formatMessage({ id: "year", defaultMessage: "years" })}`,
        value: "1y",
      },
      ...(!small
        ? [
            {
              label: intl.formatMessage({
                id: "custom",
                defaultMessage: "Custom",
              }),
              value: "custom",
            },
          ]
        : []),
    ],
    [intl, small],
  );

  const handleTypeChange = (value: string) => {
    setType(value);
    stopInterval();
    if (type !== "custom") {
      refetchMoment();
      startInterval();
    }
  };

  const handleRefresh = () => {
    stopInterval();
    refetchMoment();
    startInterval();
    onInterval?.();
  };

  useEffect(() => {
    if (type !== "custom" && currentTime && !disabled) {
      const duration = type.match(/(\d+)|([a-zA-Z]+)/g) || [];
      const _endTime = dayjs(currentTime);
      const _startTime = dayjs(currentTime).subtract(
        Number(duration[0]),
        duration[1] as dayjs.ManipulateType,
      );
      setStartTime(_startTime.valueOf());
      setEndTime(_endTime.valueOf());
      setCustomTimeRange([_startTime, _endTime]);
      setDateRange({ from: _startTime.toDate(), to: _endTime.toDate() });
    }
  }, [currentTime, type, disabled, setStartTime, setEndTime]);

  useInterval(() => {
    if (type !== "custom") {
      increaseTime();
      onInterval?.();
    }
  }, interval);

  useImperativeHandle(ref, () => ({
    startInterval,
    stopInterval,
    refresh: refetchMoment,
  }));

  const handleCustomTimeChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setStartTime(range.from.getTime());
      setEndTime(range.to.getTime());
      setCustomTimeRange([dayjs(range.from), dayjs(range.to)]);
      setDateRange(range);
      if (type !== "custom") {
        setType("custom");
        stopInterval();
      }
    }
  };

  return (
    <div className={`flex items-center gap-1 ${style["monitor-time"]}`}>
      {!small && (
        <Button
          onClick={() => handleRefresh()}
          disabled={disabled || type === "custom"}
          className={style["monitor-refresh-button"]}
          size="icon"
          variant="secondary"
        >
          <Icon size={14} type="refresh" />
        </Button>
      )}
      <Select
        className={cls({ [style.smallSelect]: !!small })}
        options={options}
        onChange={handleTypeChange}
        value={type}
        width="s"
      />
      {!small && (
        <RangePicker
          selected={dateRange as any}
          onSelect={handleCustomTimeChange}
        />
      )}
    </div>
  );
};

export default forwardRef(BusinessMonitorTime);
