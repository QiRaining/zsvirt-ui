import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import { useQueryConfig } from "@zstack/zsphere-engine/src/baremetal-pxe-server";
import type { IListProps } from "@zstack/zsphere-types";
import type { BaremetalPxeServer as IBaremetalPxeServer } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig } from "../config";

const QUERY_BAREMETAL_PXE_SERVER_LIST = gql`
  query baremetalPxeServerList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $type: BaremetalPxeServerQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    baremetalPxeServerList(
      conditions: $conditions
      start: $start
      limit: $limit
      replyWithCount: true
      type: $type
      extraConditions: $extraConditions
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      list {
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
      total
    }
  }
`;

const BaremetalPxeServerList: React.FC<IListProps<IBaremetalPxeServer>> = (
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
      gql={QUERY_BAREMETAL_PXE_SERVER_LIST}
      type="BaremetalPxeServer"
      resource="baremetal.pxe.service"
      {...props}
    />
  );
};

export default BaremetalPxeServerList;
