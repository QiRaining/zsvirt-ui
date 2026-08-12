import {
  getThemeColor,
  getNeutralColor,
  Color,
  formatStorageToObj,
  parseNumber,
  formatPercent,
  formatBytesToSize,
  formatBytes,
  formatOps,
  formatPps,
  formatCount,
} from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import _ from "lodash-es";

import niceTicks from "./nice-tick";
import { IValueType } from "./type";

dayjs.extend(duration);

// 暂时只有一种主题
const mode = "light";

export function getThemeColorList(count?: number) {
  const themeList: Color.ITheme[] = [
    "blue",
    "yellow",
    "green",
    "teal",
    "red",
    "purple",
    "violet",
    "yellow-green",
  ];
  const colorList: string[] = [];

  for (let i = 0; i < (count || themeList.length); i += 1) {
    const theme = themeList[i % themeList.length];
    const color = getThemeColor(theme, mode, 500);
    colorList.push(color);
  }

  return colorList;
}

export function getStrokeColor() {
  return getNeutralColor(mode, 300);
}

export function getTimeAxisFormatter(
  startTime: dayjs.ConfigType,
  endTime: dayjs.ConfigType,
) {
  const diffMs = dayjs(startTime).diff(dayjs(endTime));
  const dur = dayjs.duration(diffMs);
  let format = "HH:mm";
  if (-dur.asYears() >= 1) {
    format = "YYYY-MM";
  }
  if (-dur.asWeeks() >= 1) {
    format = "MM-DD";
  }
  return (input: dayjs.ConfigType) => formatTime(input, format);
}

export function formatTime(input: dayjs.ConfigType, format?: string) {
  let value = input;
  if (_.isString(input)) {
    value = parseInt(input as string, 10);
  }
  return dayjs(value).format(format);
}

interface IValueTickProps {
  max?: number;
  min?: number;
  count?: number;
  type?: IValueType;
}

export function getValueTicks(props: IValueTickProps): number[] {
  const { min = 0, max: originMax, count = 4, type } = props;
  let max = originMax;
  if (!max || max === 0 || max < count) {
    max = count;
  }
  let domain = [min, max];
  let ticks: number[] = [];

  switch (type) {
    case "bytes":
    case "bytesSpeed": {
      const { number, unit } = formatStorageToObj(max, 2);
      if (typeof number === "number") {
        domain = [min, number];
        const storageTicks = niceTicks(domain, count);
        ticks = storageTicks.map((item) => parseNumber(item, unit));
      }
      break;
    }
    default: {
      ticks = niceTicks(domain, count);
      break;
    }
  }

  return ticks;
}

interface ITimeTickProps {
  startTime: dayjs.ConfigType;
  endTime: dayjs.ConfigType;
  count?: number;
}
export function getTimeTicks(props: ITimeTickProps): number[] {
  const { startTime, endTime, count = 6 } = props;
  const start = dayjs(Number(startTime)).valueOf();
  const end = dayjs(Number(endTime)).valueOf();
  const ticks: number[] = [];

  const step = Math.ceil((end - start) / (count - 1));
  for (let i = 0; i < count; i += 1) {
    const time = start + step * i;
    ticks.push(time);
  }

  return ticks;
}

function convertStringToNumber(str: string): number {
  const regex = /^[0-9]+(\.[0-9]+)?$/;
  if (regex.test(str)) {
    return parseFloat(str);
  }
  return 0;
}

export function getValueFormatter(type?: IValueType) {
  return (value: string): string => {
    const numValue = convertStringToNumber(value);
    switch (type) {
      case "percentage":
        return formatPercent(numValue);
      case "bytes":
        return formatBytesToSize(numValue);
      case "bytesSpeed":
        return formatBytes(numValue);
      case "ops":
        return formatOps(numValue);
      case "pps":
        return formatPps(numValue);
      case "latency":
        return `${Math.round(numValue * 100) / 100} ms`;
      case "temperature":
        return `${Math.round(numValue * 100) / 100} ℃`;
      default:
        return formatCount(numValue).toString();
    }
  };
}
