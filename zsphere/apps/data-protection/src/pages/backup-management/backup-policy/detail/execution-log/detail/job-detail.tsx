import { useQuery } from "@apollo/client";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard, TaskDot } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op, SchedulerJobGroupType } from "@zstack/zsphere-types";
import type {
  SchedulerJobHistoryList,
  SchedulerJobHistoryGroupByFireInstanceId,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod, formatBytesToSize } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { schedulerJobHistoryList } from "../../../../../../gql/scheduled-job-history.gql";
import ApiDetail from "./api-detail";
import type { OptionValueType } from "./result-filter";
import ResultFilter from "./result-filter";
import Status, { getStatus } from "./status";

import style from "./style.module.less";

interface IResp {
  schedulerJobHistoryList?: SchedulerJobHistoryList;
}

export interface IProps {
  source?: SchedulerJobHistoryGroupByFireInstanceId;
}

export default function JobDetail({ source }: IProps) {
  const intl = useIntl();
  const { data } = useQuery<IResp>(schedulerJobHistoryList, {
    variables: {
      conditions: [
        { key: "fireInstanceId", op: Op.eq, value: source?.fireInstanceId },
      ],
    },
  });

  const [filter, setFilter] = useState<OptionValueType>();
  const [index, setIndex] = useState(0);
  const historyList = data?.schedulerJobHistoryList?.list;
  const filteredHistoryList =
    !filter || filter === "all.result"
      ? historyList
      : historyList?.filter((item) => getStatus(item) === filter);
  const current = filteredHistoryList?.[index];
  const request = useMemo(
    () => (current?.requestDump ? JSON.parse(current.requestDump) : {}),
    [current],
  );

  const list = useMemo<ListItem[]>(
    () => [
      {
        label: intl.formatMessage({ id: "object", defaultMessage: "Target" }),
        value:
          current?.jobType === SchedulerJobGroupType.databaseBackup
            ? intl.formatMessage({
                id: "platform.database",
                defaultMessage: "Platform Database",
              })
            : current?.resourceInfo?.name,
      },
      {
        label: intl.formatMessage({
          id: "backup.task.result",
          defaultMessage: "Backup Job Result",
        }),
        value: <Status current={current} />,
      },
      {
        label: intl.formatMessage({
          id: "backup.name",
          defaultMessage: "Backup Name",
        }),
        value: request.name,
      },
      {
        label: intl.formatMessage({
          id: "backup.capacity",
          defaultMessage: "Backup Size",
        }),
        value:
          current?.backupCapacity && formatBytesToSize(current.backupCapacity),
      },
      {
        label: intl.formatMessage({
          id: "backup.time.consumption",
          defaultMessage: "Time Consumed",
        }),
        value:
          current?.executeTime && formatSecToPeriod(current.executeTime, intl),
      },
      {
        label: intl.formatMessage({
          id: "startTime",
          defaultMessage: "Start Time",
        }),
        value:
          current?.startTime &&
          dayjs(new Date(current.startTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: intl.formatMessage({
          id: "endTime",
          defaultMessage: "End Time",
        }),
        value:
          current?.endTime &&
          dayjs(Number(current.endTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [current, intl, request],
  );

  return (
    <AutoSkeleton name="backup-job-detail" loading={!historyList?.length}>
      {historyList?.length ? (
        <div className={style.jobDetail}>
          <div className={style.jobDetailHeader}>
            <span className={style.jobDetailTitle}>
              {intl.formatMessage({
                id: "backup.detail",
                defaultMessage: "Backup Details",
              })}
            </span>
            <ResultFilter
              historyList={historyList}
              value={filter}
              onChange={(value) => {
                setFilter(value as OptionValueType);
                setIndex(0);
              }}
            />
          </div>
          <div className={style.taskDotWrapper}>
            {filteredHistoryList?.map((item, idx) => (
              <TaskDot
                key={item.id}
                task={{ status: getStatus(item) } as any}
                checked={index === idx}
                onClick={() => setIndex(idx)}
              />
            ))}
          </div>
          <DraggableCard
            title={intl.formatMessage({
              id: "sub.task.baseInfo",
              defaultMessage: "Subtask Basic Information",
            })}
            isList
          >
            <List list={list} bordered={false} />
          </DraggableCard>
          <ApiDetail current={current} />
        </div>
      ) : null}
    </AutoSkeleton>
  );
}
