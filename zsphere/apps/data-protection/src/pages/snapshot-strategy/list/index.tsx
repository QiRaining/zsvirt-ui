import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SnapshotStrategy } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const snapshotStrategyList = gql`
  query snapshotStrategyList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!] = []
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    snapshotStrategyList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        description
        state
        jobsUuid
        jobs {
          uuid
          name
          jobData
          targetResourceUuid
          schedulerJobGroupUuids
          lastOpDate
          createDate
        }
        jobData
        triggersUuid
        triggers {
          uuid
          name
          cron
          startTime
          stopTime
          lastOpDate
          createDate
        }
        owner {
          uuid
          name
          type
        }
        lastOpDate
        createDate
      }
    }
  }
`;

const SnapshotStrategyList: React.FC<IListProps<SnapshotStrategy>> = (
  props,
) => {
  const queryConfig = useQueryConfig();
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={snapshotStrategyList}
      type="SnapshotStrategy"
      resource="snapshot.strategy"
      toolbar={["search", "refresh", "operation"]}
      {...props}
    />
  );
};

export default SnapshotStrategyList;
