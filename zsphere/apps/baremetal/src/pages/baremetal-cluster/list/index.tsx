import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const QUERY_BAREMETAL_CLUSTER_LIST = gql`
  query queryClusterList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    clusterList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
        name
        uuid
        description
        createDate
        lastOpDate
        clusterKVMCpuModel
        checkCpuModel
        checkCpuModelId
        displayNetworkCidr
        migrateNetworkCidr
        type
        state
        hypervisorType
        isShowDrsTab
        isSupported
        isMaintenanceOfAllHost
        isAttachL2network
        isAttachPrimaryStorage
        isAttachBaremetalPxeServer
        primaryStorageCount
        volumeCount
        baremetalChassisNum
        baremetalInstanceNum
        baremetalPxeServer {
          name
          uuid
          description
          dhcpInterface
          dhcpRangeBegin
          dhcpRangeEnd
          hostname
          storagePath
          availableCapacity
          totalCapacity
          state
          sshPort
          status
          attachedClusterUuids
          createDate
          lastOpDate
        }
        runningVm
        zoneUuid
        zone {
          name
          uuid
        }
        hostList {
          uuid
          name
        }
      }
      total
    }
  }
`;

const BareMetalClusterList: React.FC<IListProps<ICluster>> = ({
  helper,
  ...props
}) => {
  const mergedDefaultQuery = useMemo(() => {
    const defaultConditions = [
      {
        key: "hypervisorType",
        op: Op.eq,
        value: "baremetal",
      },
    ];
    return {
      conditions: [
        ...(props.defaultQuery?.conditions || []),
        ...defaultConditions,
      ],
    };
  }, [props.defaultQuery]);

  const queryConfig = useQueryConfig(mergedDefaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig as any}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={QUERY_BAREMETAL_CLUSTER_LIST}
      type="Cluster"
      resource="baremetal.cluster"
      {...props}
      defaultQuery={mergedDefaultQuery}
    />
  );
};

export default BareMetalClusterList;
