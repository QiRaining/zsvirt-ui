import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ListItem } from "@zstack/zsphere-components";
import { List, DraggableCard, TaskDot } from "@zstack/zsphere-components";
import { AutoSkeleton } from "@zstack/zsphere-design-biz";
import { Op } from "@zstack/zsphere-types";
import type {
  SchedulerJobHistory,
  SchedulerJobHistoryList,
  SchedulerJobHistoryGroupByFireInstanceId,
} from "@zstack/zsphere-types/graphql";
import { formatSecToPeriod } from "@zstack/zsphere-utils";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import type { OptionValueType } from "./result-filter";
import ResultFilter from "./result-filter";
import Status, { getStatus } from "./status";

import style from "./style.module.less";

interface IResp {
  schedulerJobHistoryList?: SchedulerJobHistoryList;
}

export interface IProps {
  source?: SchedulerJobHistoryGroupByFireInstanceId;
  onShowApi?: (current?: SchedulerJobHistory) => void;
}

const schedulerJobHistoryList = gql`
  query schedulerJobHistoryList(
    $conditions: [Condition!]
    $type: SchedulerJobHistoryQueryType
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $limit: Int
    $start: Int
    $groupBy: String
  ) {
    schedulerJobHistoryList(
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      limit: $limit
      start: $start
      sortBy: $sortBy
      sortDirection: $sortDirection
      groupBy: $groupBy
      replyWithCount: true
    ) {
      total
      list {
        executeTime
        fireInstanceId
        id
        jobType
        requestDump
        resultDump
        schedulerJobUuid
        startTime
        success
        targetResourceUuid
        triggerUuid
        endTime
        vmInstance {
          name
          uuid
        }
        volume {
          name
          uuid
          type
        }
        resourceInfo {
          uuid
          name
        }
        backupCapacity
      }
    }
  }
`;

export default function JobDetail({ source, onShowApi }: IProps) {
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
        label: intl.formatMessage({
          id: "vmInstanceName",
          defaultMessage: "Name",
        }),
        value: request.vmInstance?.name,
      },
      {
        label: intl.formatMessage({
          id: "snapshotName",
          defaultMessage: "Snapshot Name",
        }),
        value: request.name,
      },
      {
        label: intl.formatMessage({
          id: "subTask.result",
          defaultMessage: "Sub-task Result",
        }),
        value: <Status current={current} />,
      },
      {
        label: intl.formatMessage({
          id: "execution.startTime",
          defaultMessage: "Start Time",
        }),
        value:
          current?.startTime &&
          dayjs(new Date(current.startTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
      {
        label: intl.formatMessage({ id: "used.time", defaultMessage: "Time Consumed" }),
        value:
          typeof current?.executeTime === "number"
            ? formatSecToPeriod(current.executeTime, intl)
            : undefined,
      },
      {
        label: intl.formatMessage({
          id: "execution.endTime",
          defaultMessage: "Completion Time",
        }),
        value:
          current?.endTime &&
          dayjs(Number(current.endTime)).format("YYYY-MM-DD HH:mm:ss"),
      },
    ],
    [current, intl, request],
  );

  const apiList = useMemo<ListItem[]>(
    () => [
      {
        label: "CreateVolumeSnapshotGroupJob",
        value: (
          <div className={style.apiList}>
            <Status current={current} />
            <a onClick={() => onShowApi?.(current)}>
              {intl.formatMessage({ id: "check", defaultMessage: "View" })}
            </a>
          </div>
        ),
      },
    ],
    [current, intl, onShowApi],
  );

  return (
    <AutoSkeleton name="snapshot-job-detail" loading={!historyList?.length}>
      {historyList?.length ? (
        <div className={style.jobDetail}>
          <div className={style.jobDetailHeader}>
            <span className={style.jobDetailTitle}>
              {intl.formatMessage({
                id: "subTask.detail",
                defaultMessage: "Sub-task Details",
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
          <DraggableCard
            title={intl.formatMessage({
              id: "api.run.result",
              defaultMessage: "API Results",
            })}
            isList
          >
            <List list={apiList} bordered={false} />
          </DraggableCard>
        </div>
      ) : null}
    </AutoSkeleton>
  );
}
