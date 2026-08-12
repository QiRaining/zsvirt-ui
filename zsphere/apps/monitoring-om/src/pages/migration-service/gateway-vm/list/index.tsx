import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { ITableListProps } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { Item } from "@zstack/zsphere-types";
import React from "react";

import {
  useActionConfig as _useActionConfig,
  useColumnConfig as _useColumnConfig,
  useQueryConfig as _useQueryConfig,
} from "../config";

const queryGatewayVmInstanceList = gql`
  query queryGatewayVmInstanceList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: String
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    gatewayVmInstanceList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      replyWithCount: true
      sortBy: $sortBy
      sortDirection: $sortDirection
    ) {
      total
      list {
        uuid
        name
        state
        cpuNum
        memorySize
        storageSize
        defaultIp
        createDate
        lastOpDate
        clusterUuid
        hostUuid
        hypervisorType
        type
        platform
        architecture
        state
        defaultIp
      }
    }
  }
`;

const GatewayVmList: React.FC<
  IListProps<Item> & Partial<ITableListProps<Item>>
> = ({
  useQueryConfig = _useQueryConfig,
  useColumnConfig = _useColumnConfig,
  useActionConfig = _useActionConfig,
  ...props
}) => {
  const queryConfig = useQueryConfig({ defaultQuery: props.defaultQuery });
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig({
    view: props.view,
  });

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={queryGatewayVmInstanceList}
      type="GatewayVmInstance"
      resource="gateway.vm"
      {...props}
    />
  );
};

export default React.memo(GatewayVmList);
