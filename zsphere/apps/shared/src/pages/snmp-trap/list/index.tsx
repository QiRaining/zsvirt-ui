import { gql } from "@apollo/client";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SnmpTrapReceiver } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const snmpTrapList = gql`
  query snmpTrapList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $type: SnmpTrapReceiverQueryType
    $sortDirection: SortDirectionValidValues
  ) {
    snmpTrapList(
      conditions: $conditions
      extraConditions: $extraConditions
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
        snmpAddress
        snmpPort
        createDate
        lastOpDate
      }
    }
  }
`;

const SnmpTrapList: React.FC<IListProps<SnmpTrapReceiver>> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={snmpTrapList}
      type="SnmpTrap"
      resource="snmp.trap"
      {...props}
    />
  );
};

export default SnmpTrapList;
