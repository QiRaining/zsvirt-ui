import type { ValueProps } from "@zstack/zsphere-components";
import { parseNumber } from "@zstack/zsphere-utils";

export const useFormatFunction = () => {
  // 忽略单位
  const formatUnitWithNoUnit = (values: ValueProps): string => {
    return String(values.number);
  };

  const formatUnitWithStorage = (values: ValueProps): string => {
    return `${parseNumber(Number(values?.number), String(values?.unit))}`;
  };

  // 后端带单位
  const formatUnitWithUnit = (values: ValueProps): string => {
    return `${values?.number}${values?.unit}`;
  };

  const formatTimeToSec = (values: ValueProps): string => {
    const number = values?.number;
    const unit = values?.unit;
    let _value = Number(number);
    switch (unit) {
      case "s":
        _value = Number(number);
        break;
      case "m":
        _value = Number(number) * 60;
        break;
      case "h":
        _value = Number(number) * 60 * 60;
        break;
      case "d":
        _value = Number(number) * 60 * 60 * 24;
        break;
    }
    return `${_value}`;
  };

  const formatHaHostCheckSuccessRatio = (values: ValueProps): string => {
    return `${Number(values?.number) / 100}`;
  };

  const formatDayToMillisecondTime = (values: ValueProps): string => {
    const number = values?.number;
    return `${Number(number) * 24 * 60 * 60 * 1000}`;
  };

  return {
    formatUnitWithNoUnit,
    formatUnitWithStorage,
    formatUnitWithUnit,
    formatHaHostCheckSuccessRatio,
    formatTimeToSec,
    formatDayToMillisecondTime,
  };
};
