import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

interface TimeRangeConfig {
  condition: (d: duration.Duration) => boolean;
  points: number;
}

const timeRangeConfigs: TimeRangeConfig[] = [
  { condition: (d) => -d.asYears() >= 1, points: 52704 },
  { condition: (d) => -d.asWeeks() >= 8, points: 8064 },
  { condition: (d) => -d.asWeeks() >= 2, points: 4464 },
  { condition: (d) => -d.asWeeks() >= 1, points: 2016 },
  { condition: (d) => -d.asDays() >= 1, points: 288 },
  { condition: (d) => -d.asHours() >= 6, points: 72 },
  { condition: (d) => -d.asHours() >= 1, points: 12 },
];

export const getPeriod = (startTime: number, endTime: number): number => {
  const timeDuration = dayjs.duration(dayjs(startTime).diff(dayjs(endTime)));

  return (
    timeRangeConfigs.find(({ condition }) => condition(timeDuration))?.points ??
    3
  );
};
