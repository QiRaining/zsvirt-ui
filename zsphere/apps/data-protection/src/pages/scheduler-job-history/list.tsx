import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SchedulerJobHistory as ISchedulerJobHistory } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "./config/useActionConfig";
import useColumnConfig from "./config/useColumnConfig";
import useQueryConfig from "./config/useQueryConfig";

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

const SchedulerJobHistoryList: React.FC<
  IListProps<ISchedulerJobHistory> &
    Partial<
      Pick<
        ITableListProps<ISchedulerJobHistory>,
        "rowSelection" | "toolbar" | "expandable" | "rowKey" | "tableProps"
      >
    >
> = (props) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({ view: props.view, type: "single" });

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={schedulerJobHistoryList}
      type="SchedulerJobHistory"
      {...props}
    />
  );
};

export default SchedulerJobHistoryList;
