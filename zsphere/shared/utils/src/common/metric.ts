import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

// http://momentjs.cn/docs/#/durations/creating/
// 两周以上取600个点，以下取300个
export const getPeriod = (startTime: number, endTime: number): number => {
  const diff = dayjs.duration(dayjs(startTime).diff(dayjs(endTime)));
  if (-diff.asYears() >= 1) {
    return 52704;
  }
  if (-diff.asWeeks() >= 8) {
    return 8064;
  }
  if (-diff.asWeeks() >= 2) {
    return 4464;
  }
  if (-diff.asWeeks() >= 1) {
    return 2016;
  }
  if (-diff.asDays() >= 1) {
    return 288;
  }
  if (-diff.asHours() >= 6) {
    return 72;
  }
  if (-diff.asHours() >= 1) {
    return 12;
  }
  return 3;
};
