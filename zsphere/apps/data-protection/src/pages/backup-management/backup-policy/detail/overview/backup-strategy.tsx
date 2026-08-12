import { useQuery } from "@apollo/client";
import type { ListItem, IDraggableCardProps } from "@zstack/zsphere-components";
import { List, DraggableCard } from "@zstack/zsphere-components";
import { SchedulerJobGroupType, SchedulerType } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import dayjs from "dayjs";
import { partition } from "lodash-es";
import { useMemo } from "react";
import { useIntl } from "react-intl";

import { globalConfig } from "../../../../../../../administration/src/gql/global-config.gql";
import { getChainLength } from "../../action/components/ChainLength";
import type { IFormatCronProps, ICronParam } from "../../utils";
import {
  parseCron,
  formatCronDescription,
  getCronDescription,
} from "../../utils";
import { formatDiskSpeed } from "./advanced-config";

import style from "./style.module.less";

interface IProps extends IDraggableCardProps {
  current?: SchedulerJobGroup;
}

export default function ExecutionStrategy({ current, ...props }: IProps) {
  const intl = useIntl();

  const { data } = useQuery(globalConfig, {
    variables: {
      category: "volumeBackup",
      name: "incrementalBackup.maxNum",
    },
  });

  const incrementalBackupMaxNum = data?.globalConfig?.value ?? 64;

  const [
    incrementalCronParam,
    fullCronParam,
    triggerStartTime,
    fullBackupTriggerUuid,
  ] = useMemo(() => parseTrigger(current), [current]);

  const qos = useMemo(
    () => JSON.parse(current?.jobData || "{}"),
    [current],
  ).backupQosStruct;

  const chainLength = useMemo(() => {
    if (!fullBackupTriggerUuid) {
      return incrementalBackupMaxNum;
    }
    let incrementalPeriodType = "";
    if (incrementalCronParam) {
      if (incrementalCronParam.hourInterval) {
        incrementalPeriodType = "hour";
      } else if (incrementalCronParam.minuteInterval) {
        incrementalPeriodType = "minute";
      } else if (incrementalCronParam.executeTimeList) {
        incrementalPeriodType = "day";
      } else if (incrementalCronParam.periodByWeek) {
        incrementalPeriodType = "week";
      } else if (incrementalCronParam.periodByMonth) {
        incrementalPeriodType = "month";
      }
    }
    let fullPeriodType = "";
    if (fullCronParam) {
      if (fullCronParam.periodByWeek) {
        fullPeriodType = "week";
      } else if (fullCronParam.periodByMonth) {
        fullPeriodType = "month";
      }
    }
    return getChainLength({
      incrementalPeriodType,
      incrementalMonthInterval: incrementalCronParam?.monthInterval ?? 0,
      incrementalHourInterval: incrementalCronParam?.hourInterval ?? 0,
      incrementalMinuteInterval: incrementalCronParam?.minuteInterval ?? 0,
      incrementalPeriodByWeek: incrementalCronParam?.periodByWeek ?? 0,
      incrementalPeriodByMonth: incrementalCronParam?.periodByMonth ?? 0,
      incrementalExecuteTime: incrementalCronParam?.executeTime ?? 0,
      incrementalExecuteTimeList: incrementalCronParam?.executeTimeList ?? 0,
      fullPeriodType,
      fullExecuteTime: fullCronParam?.executeTime ?? 0,
      fullMonthInterval: fullCronParam?.monthInterval ?? 0,
      fullPeriodByWeek: fullCronParam?.periodByWeek ?? 0,
      fullPeriodByMonth: fullCronParam?.periodByMonth ?? 0,
    });
  }, [
    fullBackupTriggerUuid,
    incrementalCronParam,
    fullCronParam,
    incrementalBackupMaxNum,
  ]);

  const list = useMemo<ListItem[]>(() => {
    const incrementalDescription =
      incrementalCronParam &&
      getCronDescription(
        intl,
        incrementalCronParam,
        triggerStartTime?.format("YYYY-MM-DD HH:mm"),
      );
    const fullDescription =
      fullCronParam &&
      getCronDescription(
        intl,
        fullCronParam,
        triggerStartTime?.format("YYYY-MM-DD HH:mm"),
      );
    return current?.jobType === SchedulerJobGroupType.databaseBackup
      ? [
          {
            label: intl.formatMessage({
              id: "backup.period",
              defaultMessage: "Backup Cycle",
            }),
            value: incrementalDescription?.period,
          },
          {
            label: intl.formatMessage({
              id: "execute.time",
              defaultMessage: "Execution Time",
            }),
            show: !!incrementalDescription?.executeTime,
            value: incrementalDescription?.executeTime,
          },
          {
            label: intl.formatMessage({
              id: "startTime",
              defaultMessage: "Start Time",
            }),
            value: triggerStartTime?.format("YYYY-MM-DD HH:mm"),
          },
        ]
      : [
          {
            label: intl.formatMessage({
              id: "backup.mode",
              defaultMessage: "Backup Mode",
            }),
            value: fullBackupTriggerUuid
              ? intl.formatMessage({
                  id: "custom.incremental.backup",
                  defaultMessage: "Customized Incremental Backup",
                })
              : intl.formatMessage({
                  id: "default.incremental.backup",
                  defaultMessage: "Default Incremental Backup",
                }),
          },
          {
            label: intl.formatMessage({
              id: "incremental.backup.strategy",
              defaultMessage: "Incremental Backup Policy",
            }),
            value: incrementalDescription && (
              <span style={{ whiteSpace: "normal" }}>
                {formatCronDescription(intl, incrementalDescription)}
              </span>
            ),
            children: incrementalDescription && [
              {
                label: intl.formatMessage({
                  id: "backup.period",
                  defaultMessage: "Backup Cycle",
                }),
                value: (
                  <span style={{ whiteSpace: "normal" }}>
                    {incrementalDescription.period}
                  </span>
                ),
              },
              ...(incrementalDescription.executeTime
                ? [
                    {
                      label: intl.formatMessage({
                        id: "execute.time",
                        defaultMessage: "Execution Time",
                      }),
                      value: incrementalDescription.executeTime,
                    },
                  ]
                : []),
            ],
          },
          {
            label: intl.formatMessage({
              id: "full.backup.strategy",
              defaultMessage: "Full Backup Policy",
            }),
            show: !!fullDescription,
            value: fullDescription && (
              <span style={{ whiteSpace: "normal" }}>
                {formatCronDescription(intl, fullDescription)}
              </span>
            ),
            children: fullDescription && [
              {
                label: intl.formatMessage({
                  id: "backup.period",
                  defaultMessage: "Backup Cycle",
                }),
                value: (
                  <span style={{ whiteSpace: "normal" }}>
                    {fullDescription.period}
                  </span>
                ),
              },
              {
                label: intl.formatMessage({
                  id: "execute.time",
                  defaultMessage: "Execution Time",
                }),
                value: fullDescription.executeTime,
              },
            ],
          },
          {
            label: intl.formatMessage({
              id: "backup.chain.max.length",
              defaultMessage: "Backup Chain Length (Max.)",
            }),
            value: Math.min(chainLength, incrementalBackupMaxNum),
          },
          {
            label: intl.formatMessage({
              id: "startTime",
              defaultMessage: "Start Time",
            }),
            value: triggerStartTime?.format("YYYY-MM-DD HH:mm"),
          },
          {
            label: intl.formatMessage({
              id: "disk.read.speed",
              defaultMessage: "Disk Read Speed",
            }),
            value: qos?.volumeWriteBandwidth
              ? formatDiskSpeed(qos.volumeWriteBandwidth)
              : intl.formatMessage({
                  id: "not.limited",
                  defaultMessage: "Unlimited",
                }),
          },
        ];
  }, [
    current?.jobType,
    qos,
    intl,
    fullBackupTriggerUuid,
    incrementalCronParam,
    fullCronParam,
    triggerStartTime,
    chainLength,
    incrementalBackupMaxNum,
  ]);

  return (
    <DraggableCard
      {...props}
      title={intl.formatMessage({
        id: "backup.strategy",
        defaultMessage: "Backup Policy",
      })}
      isList
    >
      <List className={style.backupStrategyList} list={list} bordered={false} />
    </DraggableCard>
  );
}

export function parseTrigger(
  current?: SchedulerJobGroup,
): [
  IFormatCronProps | undefined,
  ICronParam | undefined,
  Dayjs | undefined,
  string | undefined,
] {
  if (!current?.schedulerTriggers) {
    return [undefined, undefined, undefined, undefined];
  }
  const startTime = current.schedulerTriggers[0]
    ? dayjs(current.schedulerTriggers[0].startTime)
    : undefined;
  const fullBackupTriggerUuid = JSON.parse(
    current?.jobData || "{}",
  ).fullBackupTriggerUuid;
  const [[fullTrigger], incrementalTriggers] = partition(
    current.schedulerTriggers,
    (trigger) => trigger.uuid === fullBackupTriggerUuid,
  );
  const fullParam = fullTrigger ? parseCron(fullTrigger.cron ?? "") : undefined;
  if (!incrementalTriggers.length) {
    return [undefined, fullParam, startTime, fullBackupTriggerUuid];
  }
  const { schedulerType, schedulerInterval } = incrementalTriggers[0];
  if (schedulerType === SchedulerType.simple && schedulerInterval) {
    const incrementalParam =
      schedulerInterval >= 3600
        ? {
            hourInterval: Math.floor(schedulerInterval / 3600),
          }
        : {
            minuteInterval: Math.floor(schedulerInterval / 60),
          };
    return [incrementalParam, fullParam, startTime, fullBackupTriggerUuid];
  }
  const cronParams = incrementalTriggers.map((trigger) =>
    parseCron(trigger.cron ?? ""),
  );
  const { periodByMonth, periodByWeek } = cronParams[0];
  if (!periodByMonth && !periodByWeek) {
    const incrementalParam = {
      executeTimeList: cronParams.map((param) => param.executeTime),
    };
    return [incrementalParam, fullParam, startTime, fullBackupTriggerUuid];
  }
  return [cronParams[0], fullParam, startTime, fullBackupTriggerUuid];
}
