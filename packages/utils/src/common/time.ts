import dayjs from "dayjs";

/**
 * @description 依据指定的时间间隔生成一组可选的时间范围
 * @param interval 时间间隔，默认为 1
 * @param splitSymbol 两个时间点之间的分隔符，默认为 ～
 * @returns { Array<string> } ["00:00-01:00", ..., "23:00-00:00"]
 */
export const generateHourlyArray = (
  interval = 1,
  splitSymbol = "~",
): string[] => {
  const startOfDay = dayjs().startOf("day");
  const hourlyArray = [];

  for (let i = 0; i < 24; i++) {
    const startHour = startOfDay.clone().add(i, "hours");
    const endHour = startOfDay.clone().add(i + interval, "hours");

    const timeInterval = `${startHour.format("HH:mm")}${splitSymbol}${endHour.format("HH:mm")}`;

    hourlyArray.push(timeInterval);
  }

  return hourlyArray;
};
