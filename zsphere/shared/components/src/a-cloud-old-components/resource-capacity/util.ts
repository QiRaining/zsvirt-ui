import { IResourceCapacityType } from "./type";

export function getProgressGutter(type?: IResourceCapacityType) {
  let gutter = 0;
  switch (type) {
    case IResourceCapacityType.Percentage:
      gutter = 0;
      break;
    case IResourceCapacityType.Ratio:
      gutter = 6;
      break;
    case IResourceCapacityType.Distribution:
      gutter = 1;
      break;
  }
  return gutter;
}

export function getProgressStatus(amounts: number[]) {
  if (amounts.length === 0) {
    return "";
  }
  const used = amounts[0];
  if (used <= 0) {
    return "";
  }

  const total = amounts.reduce((a, b) => a + b, 0);
  if (total === 0) {
    return "";
  }

  const usedRate = used / total;
  if (usedRate < 0.6) {
    return "info";
  }
  if (usedRate < 0.8) {
    return "alert";
  }
  return "danger";
}
