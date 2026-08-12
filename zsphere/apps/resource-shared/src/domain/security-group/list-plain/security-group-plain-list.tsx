import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { SecurityGroup as ISecurityGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const securityGroupList = gql`
  query securityGroupList(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
    $type: SecurityGroupQueryType
    $extraConditions: [Condition!]
  ) {
    securityGroupList(
      conditions: $conditions
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      type: $type
      extraConditions: $extraConditions
    ) {
      list {
        uuid
        name
        description
        state
        createDate
        lastOpDate
        attachedL3NetworkUuids
        rules {
          ...securityGroupRuleField
        }
        vmNicCount
        owner {
          uuid
          name
          type
        }
      }
      total
    }
  }
`;

const securityGroupListForSelect = gql`
  query securityGroupListForSelect(
    $conditions: [Condition!]
    $start: Int
    $limit: Int
    $type: SecurityGroupQueryType
    $extraConditions: [Condition!]
  ) {
    securityGroupList(
      conditions: $conditions
      start: $start
      limit: $limit
      type: $type
      extraConditions: $extraConditions
    ) {
      list {
        uuid
        name
        state
        createDate
        attachedL3NetworkUuids
        owner {
          uuid
          name
          type
        }
      }
      total
    }
  }
`;

export interface ISecurityGroupPlainListProps extends Omit<
  ITableListProps<ISecurityGroup>,
  "gql"
> {
  toolbar?: ITableListProps<ISecurityGroup>["toolbar"];
  gql?: DocumentNode;
}

const SecurityGroupPlainList: React.FC<ISecurityGroupPlainListProps> = ({
  actionConfig,
  columnConfig,
  queryConfig,
  ...props
}) => {
  const gql = useMemo(() => {
    if (props.view === "select") {
      return securityGroupListForSelect;
    }
    return securityGroupList;
  }, [props.view]);

  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<ISecurityGroup>["actionConfig"];

  const defaultColumnConfig = useColumnConfig({ source: props.source });
  const defaultQueryConfig = useQueryConfig({
    view: props?.view,
    defaultQuery: props.defaultQuery,
  });

  return (
    <TableList
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={props?.gql ?? gql}
      type="SecurityGroup"
      resource="security.group"
      {...props}
    />
  );
};

export default SecurityGroupPlainList;
