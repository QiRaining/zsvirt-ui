import type { AlarmResult, EventResult } from "./types";

export const transferMessageKey = (message: EventResult | AlarmResult) => {
  const obj: any = {};
  for (const [key, value] of Object.entries(message)) {
    const _key = key
      .split("_")
      .slice(1)
      .map((item, index) => {
        const lowerStr = item.toLowerCase();
        return index === 0 ? lowerStr : lowerStr.replace(lowerStr[0], item[0]);
      })
      .join("");
    obj[_key] = value;
  }
  obj.metricName = obj.metric;
  obj.type = Object.keys(message).some((item) => item.includes("ALARM"))
    ? "alarm"
    : "event";
  return obj as any;
};
