import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { DRS } from "@zstack/zsphere-types/graphql";
import React from "react";

import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const GET_CLUSTER_DRS_LIST = gql`
  query clusterDRSList(
    $start: Int
    $limit: Int
    $conditions: [Condition!]
    $extraConditions: [Condition!]
  ) {
    queryClusterDRSList(
      start: $start
      limit: $limit
      conditions: $conditions
      extraConditions: $extraConditions
      replyWithCount: true
    ) {
      list {
        clusterUuid
        cluster {
          uuid
          name
        }
        state
        balancedState
        automationLevel
        isSupported
        thresholds {
          thresholdName
          thresholdValue
          operator
        }
        resourceConfigValue {
          hostCpuOverProvisioningRatio
          mevocoOverProvisioningMemory
          kvmIgnoreMsrs
          premiumClusterEnableZeroCopy
          kvmReservedMemory
          premiumClusterHugepageEnable
          haVmHaLevel
          vmVmHaAcrossClusters
          vmEmulateHyperV
          vmVideoType
          kvmAutoSetVmNicMultiqueue
          drsDrsMigrateVmConcurrent
          drsDrsSchedulingInterval
        }
        thresholdDuration
        description
        createDate
        lastOpDate
        uuid
        name
      }
      total
    }
  }
`;
const List: React.FC<IListProps<DRS>> = ({ helper: _helper, ...props }) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={GET_CLUSTER_DRS_LIST}
      toolbar={["refresh", "operation", "search"]}
      type="ClusterDRS"
      resource="dynamic.resource.ispatch.strategy"
      {...props}
    />
  );
};

export default List;
