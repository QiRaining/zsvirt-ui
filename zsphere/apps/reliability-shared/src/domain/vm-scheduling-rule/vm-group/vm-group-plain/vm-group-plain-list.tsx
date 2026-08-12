import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { VmGroup } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const VM_GROUP_LIST = gql`
  query vmGroupList(
    $conditions: [Condition!]
    $type: VmGroupQueryType
    $extraConditions: [Condition!]
    $limit: Int
    $start: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    vmGroupList(
      conditions: $conditions
      type: $type
      extraConditions: $extraConditions
      limit: $limit
      start: $start
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      total
      list {
        uuid
        name
        description
        vmCount
        vmSchedulingRuleCount
        associatedVmSchedulingRuleList {
          uuid
          name
          rule
          mode
          hostGroup {
            uuid
            name
          }
        }
        zoneUuid
        zone {
          uuid
          name
        }
        createDate
        lastOpDate
        owner {
          uuid
          name
        }
      }
    }
  }
`;

export interface IVmGroupPlainListProps extends Omit<
  ITableListProps<VmGroup>,
  "gql"
> {
  toolbar?: ITableListProps<VmGroup>["toolbar"];
  gql?: DocumentNode;
  source?: ITableListProps<VmGroup>["source"];
  zoneUuid?: string;
}

const VmGroupPlainList: React.FC<IVmGroupPlainListProps> = ({
  zoneUuid,
  columnConfig,
  actionConfig,
  queryConfig,
  ...props
}) => {
  const defaultQueryConfig = useQueryConfig();
  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<VmGroup>["actionConfig"];
  const defaultColumnConfig = useColumnConfig({ view: props.view, zoneUuid });

  return (
    <TableList
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={props?.gql || VM_GROUP_LIST}
      type="VmGroup"
      resource="vm.group"
      {...props}
    />
  );
};

export default VmGroupPlainList;
