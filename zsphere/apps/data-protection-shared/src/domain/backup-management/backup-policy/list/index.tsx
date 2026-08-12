import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const schedulerJobGroupList = gql`
  query schedulerJobGroupList(
    $type: SchedulerJobGroupQueryType
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $extraConditions: [Condition!]
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    schedulerJobGroupList(
      type: $type
      start: $start
      limit: $limit
      replyWithCount: true
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
        jobType
        jobData
        triggersUuid
        jobsUuid
        owner {
          name
          uuid
          type
        }
        localBackupStorage {
          name
          uuid
        }
        remoteBackupStorage {
          name
          uuid
        }
        schedulerTriggers {
          uuid
          name
          description
          jobsUuid
          schedulerType
          schedulerInterval
          repeatCount
          startTime
          stopTime
          state
          cron
        }
        createDate
        lastOpDate
        zoneUuid
        zone {
          uuid
          name
        }
        lastJobResult {
          id
          fireInstanceId
          successCount
          failCount
          runningCount
        }
        jobs {
          uuid
          jobData
          targetResourceUuid
          schedulerJobGroupJobRefs {
            schedulerJobGroupUuid
            priority
          }
        }
      }
    }
  }
`;

const BackupPolicyList: React.FC<IListProps<SchedulerJobGroup>> = (props) => {
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={schedulerJobGroupList}
      type="SchedulerJobGroup"
      resource="SchedulerJobGroup"
      toolbar={["search", "refresh", "operation"]}
      {...props}
    />
  );
};

export default BackupPolicyList;
