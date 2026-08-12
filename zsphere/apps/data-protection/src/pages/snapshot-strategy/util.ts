import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(isSameOrAfter);
import type { IntlShape } from "react-intl";

// 工作日缩写 (周日是 0 或 7)
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

/**
 * 根据开始时间计算开始月份, 可能是开始时间当月或下个月, 返回 0-11, 返回 12 表示跨年
 */
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

/**
 * 将 "每 X 个月" 选项展开成月份的数组
 */
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

/**
 * 归一化时间:
 * 1. 秒数置零
 * 2. 执行时间的年月日置为与开始时间相同 (便于比较时分秒)
 */
function normalizeTime(startTime: Dayjs, executeTime: Dayjs) {
  startTime = dayjs(startTime).second(0);
  executeTime = dayjs(startTime)
    .hour(executeTime.hour())
    .minute(executeTime.minute())
    .second(0);
  return { startTime, executeTime };
}

export interface ICronParam {
  /**
   * 执行时间
   */
  executeTime: Dayjs;
  /**
   * 按周执行的工作日 (0-7)
   */
  periodByWeek?: number[];
  /**
   * 按月执行的工作日 (1-31)
   */
  periodByMonth?: number[];
  /**
   * 表示间隔每 X 个月执行
   */
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
  const dayOfMonth = periodByMonth?.length ? periodByMonth.join(",") : "?";
  const dayOfWeek =
    periodByWeek
      ?.map((week) => cronWeekValues[week])
      .filter((week) => week)
      .join(",") || "?";
  return `0 ${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
}

function parseDayOfWeek(dayOfWeek: string) {
  return dayOfWeek.split(",").reduce((prev, curr) => {
    // Cron 使用数字表示工作日的情况
    const dayNum = Number(curr) - 1;
    if (!Number.isNaN(dayNum)) {
      if (dayNum < 7 && dayNum >= 0) {
        // 表单使用 7 表示周日
        prev.push(dayNum === 0 ? 7 : dayNum);
      }
      return prev;
    }
    // Cron 使用缩写表示工作日的情况
    const dayIndex = cronWeekValues.indexOf(curr);
    if (dayIndex === -1) {
      return prev;
    }
    // 表单使用 7 表示周日
    prev.push(dayIndex === 0 ? 7 : dayIndex);
    return prev;
  }, [] as number[]);
}

export function parseCron(cron: string) {
  const [, minute, hour, dayOfMonth, month, dayOfWeek] = cron.split(" ");
  const executeTime = dayjs()
    .hour(Number(hour))
    .minute(Number(minute))
    .second(0);
  const result: ICronParam = { executeTime };
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

export interface INextExecutionTimeParam extends ICronParam {
  currentTime: Dayjs;
  startTime: Dayjs;
  endTime?: Dayjs;
}

function getNextExecutionTimeByWeek(
  beginTime: Dayjs,
  executeTime: Dayjs,
  periodByWeek: number[],
) {
  // 超过执行时间则计入下一日
  const isAfterExecutionTime = beginTime.isAfter(executeTime);
  const beginWeekday = (beginTime.day() + 1) % 7;
  const normalizedWeekdays = periodByWeek
    .map((d) => d % 7)
    .sort((a, b) => a - b);
  const nextWeekday = normalizedWeekdays.find(
    (d) => d >= beginWeekday + Number(isAfterExecutionTime),
  );
  const diff =
    nextWeekday !== undefined
      ? nextWeekday - beginWeekday
      : normalizedWeekdays[0] - beginWeekday + 7;
  return dayjs(beginTime)
    .add(diff, "days")
    .hour(executeTime.hour())
    .minute(executeTime.minute())
    .second(0);
}

function getNextExecutionTimeByMonth(
  beginTime: Dayjs,
  executeTime: Dayjs,
  periodByMonth: number[],
  monthList: number[],
) {
  // 超过执行时间则计入下一日
  const isAfterExecutionTime = beginTime.isAfter(executeTime);
  const daysOfMonth = [...periodByMonth].sort((a, b) => a - b);
  const beginDay = beginTime.date();
  const nextDay = daysOfMonth.find(
    (d) => d >= beginDay + Number(isAfterExecutionTime),
  );
  // 超过当前月份最后一天则计入下一月
  const isAfterLastDay = !nextDay;
  const beginMonth = beginTime.get("month");
  const nextMonth = monthList.find(
    (m) => m >= beginMonth + Number(isAfterLastDay),
  );
  const monthDiff =
    nextMonth !== undefined
      ? nextMonth - beginMonth
      : monthList[0] - beginMonth + 12;
  const result = dayjs(beginTime)
    .add(monthDiff, "months")
    .hour(executeTime.hour())
    .minute(executeTime.minute())
    .second(0);
  // monthDiff 为零表示下次执行仍在当前月, 此时执行的工作日一定存在; 否则在下个月第一个工作日执行
  if (monthDiff === 0) {
    result.date(nextDay!);
  } else {
    result.date(daysOfMonth[0]);
  }
  return result;
}

/**
 * 计算下一次执行时间
 */
export function getNextExecutionTime({
  executeTime,
  periodByWeek,
  periodByMonth,
  monthInterval,
  currentTime,
  startTime,
  endTime,
}: INextExecutionTimeParam) {
  const normalized = normalizeTime(startTime, executeTime);
  startTime = normalized.startTime;
  executeTime = normalized.executeTime;
  // currentTime 当前时间的秒数不需要置零
  const beginTime = startTime.isAfter(currentTime) ? startTime : currentTime;
  let result: Dayjs | null = null;
  if (periodByWeek?.length) {
    result = getNextExecutionTimeByWeek(beginTime, executeTime, periodByWeek);
  } else if (monthInterval && periodByMonth?.length) {
    const monthList = expandMonthListByInterval(
      startTime,
      executeTime,
      monthInterval,
      periodByMonth,
      "0-based",
    );
    result = getNextExecutionTimeByMonth(
      beginTime,
      executeTime,
      periodByMonth,
      monthList,
    );
  }
  if (endTime && result?.isSameOrAfter(dayjs(endTime).second(0))) {
    return null;
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

export function formatCronDescription(
  intl: IntlShape,
  { periodByWeek, periodByMonth, monthInterval, executeTime }: ICronParam,
) {
  // 按月执行
  if (monthInterval && periodByMonth?.length) {
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
      .join("、");
    return `${prefix} ${daysOfMonth} ${executeTime.format("HH:mm")}`;
  }
  // 按周执行
  if (periodByWeek?.length) {
    const prefix = intl.formatMessage({ id: "every", defaultMessage: "Every" });
    const daysOfWeek = [...periodByWeek]
      .sort((a, b) => a - b)
      .map((d) => weekDayMap[d](intl))
      .join("、");
    return `${prefix}${daysOfWeek} ${executeTime.format("HH:mm")}`;
  }
  return null;
}
