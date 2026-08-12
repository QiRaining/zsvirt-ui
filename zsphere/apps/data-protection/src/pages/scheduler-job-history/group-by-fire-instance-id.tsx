import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SchedulerJobHistoryGroupByFireInstanceId as ISchedulerJobHistoryGroupByFireInstanceId } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "./config/useActionConfig";
import useColumnConfig from "./config/useColumnConfig";
import useQueryConfig from "./config/useQueryConfig";

const schedulerJobHistoryGroupByFireInstanceIdList = gql`
  query schedulerJobHistoryGroupByFireInstanceIdList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $limit: Int
    $start: Int
    $groupBy: String
  ) {
    schedulerJobHistoryGroupByFireInstanceIdList(
      conditions: $conditions
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
        startExecutionTime
        startTime
        endTime
        success
        targetResourceUuid
        triggerUuid
        backupCapacityForSchedulerJobHistoryGroup
        vmInstance {
          name
          uuid
        }
        volume {
          name
          uuid
          type
        }
        resourceCount
        mode
        schedulerName
        successCount
        failCount
        runningCount
      }
    }
  }
`;

const SchedulerJobHistoryList: React.FC<
  IListProps<ISchedulerJobHistoryGroupByFireInstanceId> &
    Partial<
      Pick<
        ITableListProps<any>,
        | "renderMiddleToolbar"
        | "toolbar"
        | "rowSelection"
        | "actionConfig"
        | "columnConfig"
      >
    >
> = ({
  view = "main",
  defaultQuery = {},
  selectType = "checkbox",
  columnKeys = [],
  ...props
}) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({
    view,
    type: "group",
  });

  return (
    <>
      <TableList
        columnConfig={columnConfig}
        actionConfig={actionConfig}
        queryConfig={queryConfig}
        gql={schedulerJobHistoryGroupByFireInstanceIdList}
        type="SchedulerJobHistory"
        defaultQuery={defaultQuery}
        selectType={selectType}
        columnKeys={columnKeys}
        view={view}
        {...props}
      />
    </>
  );
};

export default SchedulerJobHistoryList;
