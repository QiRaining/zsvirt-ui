import { gql, useQuery } from "@apollo/client";
import { Button } from "@zstack/design";
import { Form } from "@zstack/zsphere-components";
import { useState } from "react";
import { useIntl } from "react-intl";

import ChainIllustrationModal from "./ChainIllustrationModal";

import style from "./style.module.less";

export interface IChainLengthProps {
  mode: "default" | "custom";
  incrementalPeriodType: string;
  incrementalMonthInterval: number;
  incrementalHourInterval: number;
  incrementalMinuteInterval: number;
  incrementalPeriodByWeek: number[];
  incrementalPeriodByMonth: number[];
  incrementalExecuteTime: Dayjs;
  incrementalExecuteTimeList: Dayjs[];
  fullPeriodType: string;
  fullMonthInterval: number;
  fullPeriodByWeek: number[];
  fullPeriodByMonth: number[];
  fullExecuteTime: Dayjs;
}

export const chainLengthDependencies: Array<keyof IChainLengthProps> = [
  "mode",
  "incrementalPeriodType",
  "incrementalMonthInterval",
  "incrementalHourInterval",
  "incrementalMinuteInterval",
  "incrementalPeriodByWeek",
  "incrementalPeriodByMonth",
  "incrementalExecuteTime",
  "incrementalExecuteTimeList",
  "fullPeriodType",
  "fullMonthInterval",
  "fullPeriodByWeek",
  "fullPeriodByMonth",
  "fullExecuteTime",
];

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      category
      defaultValue
      description
      name
      value
      uuid
      isValid
    }
  }
`;

export default function ChainLength({ mode, ...props }: IChainLengthProps) {
  const intl = useIntl();
  const [visible, setVisible] = useState(false);

  const { data } = useQuery(GLOBAL_CONFIG, {
    variables: {
      category: "volumeBackup",
      name: "incrementalBackup.maxNum",
    },
  });

  const incrementalBackupMaxNum = data?.globalConfig?.value ?? 64;

  return (
    <Form.Item
      label={intl.formatMessage({
        id: "backup.chain.max.length",
        defaultMessage: "Backup Chain Length (Max.)",
      })}
    >
      <div className={style.chainLength}>
        {mode === "default"
          ? incrementalBackupMaxNum
          : Math.min(getChainLength(props), incrementalBackupMaxNum)}
      </div>
      <div className={style.chainLengthDescription}>
        {intl.formatMessage({
          id: "backup.chain.max.length.description",
          defaultMessage:
            "The maximum backup chain length is 64. For data security, it is recommend to shorten the backup chain.",
        })}
        <Button
          variant="link"
          onClick={() => setVisible(true)}
          className={style.chainLengthBtn}
        >
          {intl.formatMessage({
            id: "backup.chain.learn.more",
            defaultMessage: "Learn more",
          })}
        </Button>
      </div>
      <ChainIllustrationModal visible={visible} setVisible={setVisible} />
    </Form.Item>
  );
}

export type GetChainLengthProps = Omit<IChainLengthProps, "mode">;

export function getChainLength({
  incrementalPeriodType,
  incrementalMonthInterval,
  incrementalHourInterval,
  incrementalMinuteInterval,
  incrementalPeriodByWeek,
  incrementalPeriodByMonth,
  incrementalExecuteTime,
  incrementalExecuteTimeList,
  fullPeriodType,
  fullExecuteTime,
  fullMonthInterval,
  fullPeriodByWeek,
  fullPeriodByMonth,
}: GetChainLengthProps) {
  // 全量按月备份
  if (fullPeriodType === "month") {
    if (!fullPeriodByMonth?.length) {
      return 0;
    }
    // 增量按月备份
    if (incrementalPeriodType === "month") {
      if (!incrementalPeriodByMonth?.length) {
        return 1;
      }
      const counts = groupPeriodIntoCounts(
        incrementalPeriodByMonth,
        fullPeriodByMonth,
        checkIncrementalBeforeFull(incrementalExecuteTime, fullExecuteTime),
      );
      return (
        handleFullByMonthAndIncrementalByMonth(
          fullMonthInterval,
          incrementalMonthInterval,
          incrementalPeriodByMonth.length,
          counts,
        ) + 1
      );
    }
    const maxDays = maxPeriodInterval(fullPeriodByMonth, 31, fullMonthInterval);
    // 增量按周备份
    if (incrementalPeriodType === "week") {
      if (!incrementalPeriodByWeek?.length) {
        return 1;
      }
      return (
        Math.floor(maxDays / 7) * incrementalPeriodByWeek.length +
        maxCountByInterval(incrementalPeriodByWeek, 7, maxDays % 7) +
        1
      );
    }
    // 增量按天备份
    if (incrementalPeriodType === "day") {
      const countPerDay =
        incrementalExecuteTimeList?.filter((item) => item).length ?? 0;
      return maxDays * countPerDay + 1;
    }
    // 增量按小时备份
    if (incrementalPeriodType === "hour") {
      return maxDays * Math.ceil(24 / incrementalHourInterval) + 1;
    }
    // 增量按分钟备份
    if (incrementalPeriodType === "minute") {
      return maxDays * Math.ceil((24 * 60) / incrementalMinuteInterval) + 1;
    }
  }
  // 全量按周备份
  if (fullPeriodType === "week") {
    if (!fullPeriodByWeek?.length) {
      return 0;
    }
    // 增量按周备份
    if (incrementalPeriodType === "week") {
      if (!incrementalPeriodByWeek?.length) {
        return 1;
      }
      const counts = groupPeriodIntoCounts(
        incrementalPeriodByWeek,
        fullPeriodByWeek,
        checkIncrementalBeforeFull(incrementalExecuteTime, fullExecuteTime),
      );
      return Math.max(...counts, counts[0] + counts[counts.length - 1]) + 1;
    }
    const maxDays = maxPeriodInterval(fullPeriodByWeek, 7);
    // 增量按月备份
    if (incrementalPeriodType === "month") {
      if (!incrementalPeriodByMonth?.length) {
        return 1;
      }
      return (
        maxCountByInterval(
          incrementalPeriodByMonth,
          31,
          maxDays,
          incrementalMonthInterval === 1,
        ) + 1
      );
    }
    // 增量按天备份
    if (incrementalPeriodType === "day") {
      const countPerDay =
        incrementalExecuteTimeList?.filter((item) => item).length ?? 0;
      return maxDays * countPerDay + 1;
    }
    // 增量按小时备份
    if (incrementalPeriodType === "hour") {
      return maxDays * Math.ceil(24 / incrementalHourInterval) + 1;
    }
    // 增量按分钟备份
    if (incrementalPeriodType === "minute") {
      return maxDays * Math.ceil((24 * 60) / incrementalMinuteInterval) + 1;
    }
  }
  return 0;
}

// 处理全量按月和增量按月的情况
function handleFullByMonthAndIncrementalByMonth(
  fullMonthInterval: number,
  incrementalMonthInterval: number,
  incrementalPeriodLength: number,
  counts: number[],
) {
  // 全量每月，增量每月
  if (fullMonthInterval === 1 && incrementalMonthInterval === 1) {
    return Math.max(...counts, counts[0] + counts[counts.length - 1]);
  }
  // 全量每 X 月，增量每 Y 月，X >= Y
  if (fullMonthInterval >= incrementalMonthInterval) {
    if (fullMonthInterval % incrementalMonthInterval === 0) {
      return (
        (fullMonthInterval / incrementalMonthInterval - 1) *
          incrementalPeriodLength +
        counts[0] +
        counts[counts.length - 1]
      );
    }
    if ((fullMonthInterval - 1) % incrementalMonthInterval === 0) {
      return (
        ((fullMonthInterval - 1) / incrementalMonthInterval) *
          incrementalPeriodLength +
        Math.max(counts[0], counts[counts.length - 1])
      );
    }
    return (
      Math.ceil((fullMonthInterval - 1) / incrementalMonthInterval) *
      incrementalPeriodLength
    );
  }
  // 全量每X月，增量每Y月，X < Y，可以整除
  if (incrementalMonthInterval % fullMonthInterval === 0) {
    return Math.max(...counts);
  }
  // 不可整除的情况
  return incrementalPeriodLength;
}

// 全量备份将一周或一月分成若干个区间, 求最大区间的长度
function maxPeriodInterval(days: number[], periodLength: number, interval = 1) {
  if (days.length === 0 || days.length === 1) {
    return periodLength * interval;
  }
  days = [...days].sort((a, b) => a - b);
  if (interval > 1) {
    return days[0] - days[days.length - 1] + periodLength * interval;
  }
  let result = 0;
  for (let i = 0; i < days.length; i++) {
    const j = (i + 1) % days.length;
    result = Math.max(
      result,
      (days[j] - days[i] + periodLength) % periodLength,
    );
  }
  return result;
}

// 全量备份将一周或一月分成若干个区间, 求每个区间内的增量备份次数
function groupPeriodIntoCounts(
  incremental: number[],
  full: number[],
  isIncrementalBeforeFull: boolean,
) {
  const result: number[] = [];
  incremental = [...incremental].sort((a, b) => b - a); // desc
  full = [...full, Infinity].sort((a, b) => a - b); // asc
  let count = 0;
  for (const currentFullDay of full) {
    while (
      incremental.length &&
      incremental[incremental.length - 1] <
        currentFullDay + Number(isIncrementalBeforeFull)
    ) {
      count += 1;
      incremental.pop();
    }
    result.push(count);
    count = 0;
  }
  return result;
}

// 求一周或一月内长度为 interval 的区间所能包含的最多的天数
function maxCountByInterval(
  days: number[],
  periodLength: number,
  interval: number,
  wrap = true,
) {
  if (days.length === 0 || interval === 0) {
    return 0;
  }
  if (days.length === 1 || interval === 1) {
    return 1;
  }
  if (interval >= periodLength) {
    return days.length;
  }
  days = [...days].sort((a, b) => a - b);
  let result = 0;
  for (let i = 0; i < days.length; i++) {
    let j = (i + 1) % days.length;
    while (
      j !== i &&
      (days[j] - days[i] + periodLength) % periodLength < interval
    ) {
      j += 1;
      if (!wrap && j === days.length) {
        break;
      }
      j %= days.length;
    }
    if (i === j) {
      return days.length;
    }
    result = Math.max(result, (j - i + days.length) % days.length);
    if (result === interval) {
      return result;
    }
    if (!wrap && j === days.length) {
      return result;
    }
  }
  return result;
}

function checkIncrementalBeforeFull(
  incremental: Dayjs | undefined,
  full: Dayjs | undefined,
) {
  if (!incremental || !full) {
    return false;
  }
  const incrementalMinutes = incremental.hour() * 60 + incremental.minute();
  const fullMinutes = full.hour() * 60 + full.minute();
  return incrementalMinutes < fullMinutes;
}
