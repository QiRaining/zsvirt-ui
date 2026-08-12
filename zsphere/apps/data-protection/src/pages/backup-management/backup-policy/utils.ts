import dayjs from "dayjs";
import type { IntlShape } from "react-intl";

const cronWeekValues = [
  "SUN",
  "MON",
  "TUES",
  "WED",
  "THUR",
  "FRI",
  "SAT",
  "SUN",
];

function getStartMonth(
  startTime: Dayjs,
  executeTime: Dayjs,
  periodByMonth: number[],
) {
  const startDay = startTime.date();
  const startMonth = startTime.get("month");
  const isAfterExecutionTime = startTime.isAfter(executeTime);
  const daysOfMonth = [...periodByMonth].sort((a, b) => a - b);
  const nextDay = daysOfMonth.find(
    (d) => d >= startDay + Number(isAfterExecutionTime),
  );
  return nextDay ? startMonth : startMonth + 1;
}

function expandMonthListByInterval(
  startTime: Dayjs,
  executeTime: Dayjs,
  interval: number,
  periodByMonth: number[],
  base: "1-based" | "0-based",
) {
  const startMonth = getStartMonth(startTime, executeTime, periodByMonth);
  const isOneBased = base === "1-based";
  return Array.from(
    { length: Math.floor(12 / interval) },
    (_, index) =>
      Number(isOneBased) + (startMonth % interval) + index * interval,
  );
}

function normalizeTime(startTime: Dayjs, executeTime: Dayjs) {
  startTime = dayjs(startTime).second(0);
  executeTime = dayjs(startTime)
    .hour(executeTime.hour())
    .minute(executeTime.minute())
    .second(0);
  return { startTime, executeTime };
}

export interface ICronParam {
  executeTime: Dayjs;
  periodByWeek?: number[];
  periodByMonth?: number[];
  monthInterval?: number;
}

export interface IFormatCronParam extends ICronParam {
  startTime: Dayjs;
}

export function formatCron({
  executeTime,
  startTime,
  periodByWeek,
  periodByMonth,
  monthInterval,
}: IFormatCronParam) {
  const normalized = normalizeTime(startTime, executeTime);
  startTime = normalized.startTime;
  executeTime = normalized.executeTime;
  const minute = executeTime.minute();
  const hour = executeTime.hour();
  const month =
    periodByMonth?.length && monthInterval && monthInterval !== 1
      ? expandMonthListByInterval(
          startTime,
          executeTime,
          monthInterval,
          periodByMonth,
          "1-based",
        ).join(",")
      : "*";
  let dayOfMonth = periodByMonth?.length ? periodByMonth.join(",") : "?";
  const dayOfWeek =
    periodByWeek
      ?.map((week) => cronWeekValues[week])
      .filter((week) => week)
      .join(",") || "?";
  if (dayOfMonth === "?" && dayOfWeek === "?") {
    dayOfMonth = "*";
  }
  return `0 ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
}

function parseDayOfWeek(dayOfWeek: string) {
  return dayOfWeek.split(",").reduce((prev, curr) => {
    const dayNum = Number(curr) - 1;
    if (!Number.isNaN(dayNum)) {
      if (dayNum < 7 && dayNum >= 0) {
        prev.push(dayNum === 0 ? 7 : dayNum);
      }
      return prev;
    }
    const dayIndex = cronWeekValues.indexOf(curr);
    if (dayIndex === -1) {
      return prev;
    }
    prev.push(dayIndex === 0 ? 7 : dayIndex);
    return prev;
  }, [] as number[]);
}

export function parseCron(cron: string) {
  const [, minute, hour, dayOfMonth, month, dayOfWeek] = cron.split(" ");
  const executeTime = dayjs()
    .hour(Number(hour))
    .minute(Number(minute))
    .second(0)
    .millisecond(0);
  const result: ICronParam = { executeTime };
  if (
    month === "*" &&
    ((dayOfMonth === "*" && dayOfWeek === "?") ||
      (dayOfMonth === "?" && dayOfWeek === "*"))
  ) {
    return result;
  }
  const monthList = month
    .split(",")
    .map((m) => Number(m))
    .sort((a, b) => a - b);
  if (month === "*") {
    result.monthInterval = 1;
  } else if (month.includes("/")) {
    result.monthInterval = Number(month.split("/")[1]);
  } else if (monthList.length >= 2) {
    result.monthInterval = monthList[1] - monthList[0];
  } else {
    result.monthInterval = 12;
  }
  if (dayOfMonth === "*") {
    result.periodByMonth = Array.from({ length: 31 }, (_, idx) => idx + 1);
  } else if (dayOfMonth !== "?") {
    result.periodByMonth = dayOfMonth.split(",").map((d) => Number(d));
  }
  if (dayOfWeek === "*") {
    result.periodByWeek = Array.from({ length: 7 }, (_, idx) => idx + 1);
  } else if (dayOfWeek !== "?") {
    const periodByWeek = parseDayOfWeek(dayOfWeek);
    if (periodByWeek.length) {
      result.periodByWeek = periodByWeek;
    }
  }
  return result;
}

const weekDayMap: Record<number, (intl: IntlShape) => string> = {
  1: (intl) => intl.formatMessage({ id: "monday", defaultMessage: "Mon" }),
  2: (intl) => intl.formatMessage({ id: "tuesday", defaultMessage: "Tue" }),
  3: (intl) => intl.formatMessage({ id: "wednesday", defaultMessage: "Wed" }),
  4: (intl) => intl.formatMessage({ id: "thursday", defaultMessage: "Thur" }),
  5: (intl) => intl.formatMessage({ id: "friday", defaultMessage: "Fri" }),
  6: (intl) => intl.formatMessage({ id: "saturday", defaultMessage: "Sat" }),
  7: (intl) => intl.formatMessage({ id: "sunday", defaultMessage: "Sun" }),
};

export interface IFormatCronProps extends Omit<ICronParam, "executeTime"> {
  hourInterval?: number;
  minuteInterval?: number;
  executeTimeList?: Dayjs[];
  executeTime?: Dayjs;
}

export interface ICronDescription {
  prefix?: string;
  period: string;
  executeTime?: string;
}

export function getCronDescription(
  intl: IntlShape,
  {
    periodByWeek,
    periodByMonth,
    monthInterval,
    executeTime,
    executeTimeList,
    hourInterval,
    minuteInterval,
  }: IFormatCronProps,
  startTime?: string,
): ICronDescription | undefined {
  // 按月执行
  if (monthInterval && periodByMonth?.length && executeTime) {
    const prefix =
      monthInterval === 1
        ? intl.formatMessage({ id: "everyMonth", defaultMessage: "Every Month" })
        : intl.formatMessage(
            { id: "every{number}months", defaultMessage: "Every {number} Month" },
            { number: monthInterval },
          );
    const daysOfMonth = [...periodByMonth]
      .sort((a, b) => a - b)
      .map((number) =>
        intl.formatMessage(
          { id: "{number}day", defaultMessage: "{number} Day" },
          { number },
        ),
      )
      .join("，");
    return {
      period: `${prefix}（${daysOfMonth}）`,
      executeTime: executeTime.format("HH:mm"),
    };
  }
  // 按周执行
  if (periodByWeek?.length && executeTime) {
    const prefix = intl.formatMessage({
      id: "everyWeek",
      defaultMessage: "Every week",
    });
    const daysOfWeek = [...periodByWeek]
      .sort((a, b) => a - b)
      .map((d) => weekDayMap[d](intl))
      .join("，");
    return {
      period: `${prefix}（${daysOfWeek}）`,
      executeTime: executeTime.format("HH:mm"),
    };
  }
  // 按天执行
  if (executeTimeList) {
    const period = intl.formatMessage({
      id: "every one day",
      defaultMessage: "Every 1 Day",
    });
    return {
      period,
      executeTime: executeTimeList
        .map((time) => time.format("HH:mm"))
        .join("，"),
    };
  }
  // 按小时执行
  if (startTime && hourInterval) {
    const prefix = intl.formatMessage(
      { id: "start from {time}", defaultMessage: "{time} starts" },
      { time: startTime },
    );
    const period = intl.formatMessage(
      {
        id: "every {number} hours",
        defaultMessage: "Every {number} Hour",
      },
      { number: hourInterval },
    );
    return { prefix, period };
  }
  // 按分钟执行
  if (startTime && minuteInterval) {
    const prefix = intl.formatMessage(
      { id: "start from {time}", defaultMessage: "{time} starts" },
      { time: startTime },
    );
    const period = intl.formatMessage(
      {
        id: "every {number} minutes",
        defaultMessage: "Every {number} Minute",
      },
      { number: minuteInterval },
    );
    return { prefix, period };
  }
}

export function formatCronDescription(
  intl: IntlShape,
  { prefix, period, executeTime }: ICronDescription,
) {
  const suffix = intl.formatMessage({
    id: "backup.once",
    defaultMessage: "perform one backup",
  });
  let result = period;
  if (prefix) {
    result = `${prefix}，${result}`;
  }
  if (executeTime) {
    result = `${result}，${executeTime} ${suffix}`;
  } else {
    result = `${result}${suffix}`;
  }
  return result;
}

export const translateRetentionDays = (values: any): string => {
  const _number = Number(values?.number);
  const _unit = values?.unit;
  switch (_unit) {
    case "d":
      return `${_number}`;
    case "w":
      return `${7 * _number}`;
    case "m":
      return `${30 * _number}`;
    default:
      return "1";
  }
};
