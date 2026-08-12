import type { IInputUnitProps } from "@zstack/zsphere-components";
import _ from "lodash-es";
import { useIntl } from "react-intl";

export interface ITimerMap {
  second: number;
  minute: number;
  hour: number;
  [key: string]: number;
}

export interface IUnitMap {
  second: string;
  minute: string;
  hour: string;
  [key: string]: string;
}

export const timerMap: ITimerMap = {
  second: 1,
  minute: 60,
  hour: 60 * 60,
};

export const useUnit = () => {
  const intl = useIntl();

  const unitMap: IUnitMap = {
    second: intl.formatMessage({ id: "second", defaultMessage: " seconds" }),
    minute: intl.formatMessage({ id: "minute", defaultMessage: "minutes" }),
    hour: intl.formatMessage({ id: "hours", defaultMessage: "hours" }),
  };
  const unitList = Object.values(unitMap) as IInputUnitProps["unitList"];

  const getUnitValue = (unit: string) => {
    let unitValue;
    for (const _unit in unitMap) {
      if (unitMap[_unit] === unit) {
        unitValue = _unit;
        break;
      }
    }

    return unitValue;
  };

  return { unitMap, unitList, getUnitValue };
};

export const reverseFormateTimer = (n: number, unitMap: IUnitMap) => {
  for (const unit in timerMap) {
    const num: number = _.isInteger(n / timerMap[unit])
      ? n / timerMap[unit]
      : Number((n / timerMap[unit]).toFixed(2));

    switch (unit) {
      case "second":
      case "minute":
        if (num < 60 && num > 0) {
          return {
            num,
            unit: unitMap[unit],
          };
        }
        break;
      case "hour":
        if (num < 169 && num > 0) {
          return {
            num,
            unit: unitMap[unit],
          };
        }
        break;

      default:
        return {
          num: 0,
          unit: unitMap.second,
        };
    }
  }
  return {
    num: 0,
    unit: unitMap.second,
  };
};

export const formatTimeUnit = (n: number, unitMap: IUnitMap) => {
  // 如果秒数大于等于1小时，且能够整除小时
  if (
    n >= timerMap.hour &&
    n < timerMap.hour * 169 &&
    n % timerMap.hour === 0
  ) {
    return {
      num: n / timerMap.hour,
      unit: unitMap.hour,
    };
  }

  // 如果秒数大于等于1分钟，且能够整除分钟
  if (
    n >= timerMap.minute &&
    n < timerMap.hour * 169 &&
    n % timerMap.minute === 0
  ) {
    return {
      num: n / timerMap.minute,
      unit: unitMap.minute,
    };
  }

  // 其他情况都用秒表示
  if (n > 0) {
    return {
      num: n,
      unit: unitMap.second,
    };
  }

  // 默认返回0秒
  return {
    num: 0,
    unit: unitMap.second,
  };
};
