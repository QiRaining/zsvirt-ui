import {
  getThemeColor as _getThemeColor,
  formatBytesToSize,
  getSemanticColor,
} from "@zstack/zsphere-utils";

/**
 * 格式化百分比
 */
export const formatPercentage = (
  str: number | string,
): [number, string, string] => {
  if (str <= 0) {
    return [0, "0%", "0%"];
  }
  if (str >= 100) {
    return [1, "100%", "100%"];
  }
  return [+str / 100, `${(+str).toFixed(2)}%`, `${(+str).toFixed(2)}%`];
};

/**
 * 根据百分比获取颜色值
 */
export const getPercentageColor = (
  str: number,
  isStatic: boolean = false,
  isInverse: boolean = false,
  isText = false,
): string => {
  if (isStatic && !isText) {
    return getSemanticColor("info", "light", 500);
  }
  if (isStatic && isText) {
    return "var(--neutral-800)";
  }
  if (!isInverse) {
    if (str > 0.8) {
      return getSemanticColor("danger", "light", 500);
    }
    if (str > 0.6) {
      return getSemanticColor("alert", "light", 500);
    }
    if (isText) {
      return "var(--neutral-800)";
    }
    return getSemanticColor("info", "light", 500);
  }
  if (str < 0.2) {
    return getSemanticColor("danger", "light", 500);
  }
  if (str < 0.4) {
    return getSemanticColor("alert", "light", 500);
  }
  if (isText) {
    return "var(--neutral-800)";
  }
  return getSemanticColor("info", "light", 500);
};

/**
 * 格式化单位
 */
export const formatUnit = (
  unit: string = "",
  value: number,
  valueMax: number,
): [number, string, string] => {
  switch (unit) {
    case "percentage":
      return formatPercentage(value);
    case "byteToSize":
      return [
        +value / valueMax,
        `${formatBytesToSize(value)}`,
        `${((+value / valueMax) * 100).toFixed(2)}%`,
      ];
    case "byteToSize/s":
      return [
        +value / valueMax,
        `${formatBytesToSize(value)}/s`,
        `${((+value / valueMax) * 100).toFixed(2)}%`,
      ];
    default:
      if (valueMax === 0) {
        return [0, `${value} ${unit}`, `0%`];
      }
      return [
        +value / valueMax,
        `${`${value}`.includes(".") ? value.toFixed(2) : value} ${unit}`,
        `${((+value / valueMax) * 100).toFixed(2)}%`,
      ];
  }
};

/**
 * 获取颜色
 */
export const getColor = (i: number) => {
  const colorList = [
    getSemanticColor("info", "light", 500),
    getSemanticColor("alert", "light", 500),
  ];
  return colorList[i % 2];
};

/**
 * 获取主题颜色
 */
export const getThemeColor = (i: number) => {
  const colorList = [
    _getThemeColor("blue", "light", 500),
    _getThemeColor("teal", "light", 500),
    _getThemeColor("purple", "light", 500),
    _getThemeColor("yellow", "light", 500),
    _getThemeColor("yellow-green", "light", 500),
    _getThemeColor("red", "light", 500),
    _getThemeColor("violet", "light", 500),
  ];
  return colorList[i % 7];
};

/**
 * dashboard 生成 cache key
 */
export const genCacheKey = (cacheKey: string) => {
  return `dashboard:cache:${cacheKey}`;
};
