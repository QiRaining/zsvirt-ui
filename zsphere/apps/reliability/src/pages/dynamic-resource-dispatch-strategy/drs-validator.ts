import type { Rule } from "antd/es/form";
import type { IntlShape } from "react-intl";

import type { IUnitMap } from "./utils";

interface DurationValue {
  number: number | null;
  unit: string;
}

// 转译统一unit
const reverseKeyValue = (obj: any) => {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [value, key]),
  );
};

//处理持续时间的validator
export const durationValidator = (intl: IntlShape, unitMap: IUnitMap) => {
  return async (_: Rule, value: DurationValue) => {
    const reverseUnitMap = reverseKeyValue(unitMap);

    // 检查空值
    if (!value?.number) {
      throw new Error(
        intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      );
    }

    const num = Number(value.number);
    const unit = reverseUnitMap[value.unit];
    // 转换为小时进行范围检查
    let hours = num;
    switch (unit) {
      case "second":
        hours = num / 3600;
        break;
      case "minute":
        hours = num / 60;
        break;
      case "hour":
        hours = num;
        break;
    }

    // 合并整数检查和范围检查
    if (
      !Number.isInteger(num) ||
      num < 0 ||
      hours > 6 ||
      (unit === "second" && num === 0)
    ) {
      throw new Error(
        intl.formatMessage({
          id: "drs.field.thresholdDuration.validator.range",
          defaultMessage: "Enter an integer. Allowed time ranges from 0 second to 6 hours.",
        }),
      );
    }
    return;
  };
};
//处理虚拟机迁移并发度的validator
export const positiveIntegerValidator = (intl: IntlShape) => {
  return async (_: Rule, value: number | null) => {
    if (value === null || value === undefined) {
      throw new Error(
        intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      );
    }

    if (!Number.isInteger(+value) || value < 1 || value > 100) {
      throw new Error(
        intl.formatMessage({
          id: "drs.field.validator.integer.positive",
          defaultMessage: "Enter an integer that ranges from 1 to 100.",
        }),
      );
    }

    return;
  };
};

//处理集群扫描间隔的validator
export const schedulingIntervalValidator = (
  intl: IntlShape,
  unitMap: IUnitMap,
) => {
  return async (_: Rule, value: DurationValue) => {
    const reverseUnitMap = reverseKeyValue(unitMap);

    // 检查空值
    if (!value?.number) {
      throw new Error(
        intl.formatMessage({
          id: "global.field.validator.input.required",
          defaultMessage: "This field is required.",
        }),
      );
    }

    const num = Number(value.number);
    const unit = reverseUnitMap[value.unit];

    // 转换为分钟进行比较
    let minutes = num;
    switch (unit) {
      case "second":
        minutes = num / 60;
        break;
      case "minute":
        minutes = num;
        break;
      case "hour":
        minutes = num * 60;
        break;
    }

    // 检查范围 (10分钟到168小时)
    if (
      !Number.isInteger(num) ||
      num < 0 ||
      minutes < 5 ||
      minutes > 168 * 60
    ) {
      throw new Error(
        intl.formatMessage({
          id: "drs.field.validator.integer.range",
          defaultMessage:
            "Enter an integer. Allowed time ranges from 5 minutes to 168 hours.",
        }),
      );
    }
    return;
  };
};
