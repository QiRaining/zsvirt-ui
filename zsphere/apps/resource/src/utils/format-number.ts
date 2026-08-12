import { round } from "lodash-es";

/**
 * 格式化数字保留两位小时，去除小数末尾0。
 * @param number
 */
export const formatNumber = (number: number): string =>
  round(number, 2)?.toString();
