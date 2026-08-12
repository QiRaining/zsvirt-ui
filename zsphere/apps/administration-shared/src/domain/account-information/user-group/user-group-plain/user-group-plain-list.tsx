import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import { useQueryConfig } from "@zstack/zsphere-engine/src/zsv-user-group";
import type { UserGroup as IUserGroup } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig } from "../config";

const USER_GROUP_LIST = gql`
  query userGroupList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $type: UserGroupQueryType
    $start: Int
    $limit: Int
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    userGroupList(
      conditions: $conditions
      extraConditions: $extraConditions
      type: $type
      start: $start
      limit: $limit
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
        groupUserCount
        description
        role {
          uuid
          name
          type
        }
        createDate
      }
      total
    }
  }
`;

export interface IUserGroupPlainListProps extends Omit<
  ITableListProps<IUserGroup>,
  "gql"
> {
  toolbar?: ITableListProps<IUserGroup>["toolbar"];
  gql?: DocumentNode;
}

const UserPlainGroupList: React.FC<IUserGroupPlainListProps> = ({
  columnConfig,
  actionConfig,
  queryConfig,
  ...props
}) => {
  const defaultQueryConfig = useQueryConfig();
  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IUserGroup>["actionConfig"];
  const defaultColumnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      fetchPolicy="no-cache"
      gql={props.gql ?? USER_GROUP_LIST}
      type="UserGroup"
      resource="user.group"
      {...props}
    />
  );
};

export default UserPlainGroupList;
