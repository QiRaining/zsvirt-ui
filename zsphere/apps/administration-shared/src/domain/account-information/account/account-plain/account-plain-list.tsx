import type { DocumentNode } from "@apollo/client";
import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const ACCOUNT_LIST = gql`
  query accountList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $type: AccountQueryType
    $sortBy: String
    $sortDirection: SortDirectionValidValues
  ) {
    accountList(
      conditions: $conditions
      extraConditions: $extraConditions
      start: $start
      limit: $limit
      type: $type
      sortBy: $sortBy
      sortDirection: $sortDirection
      replyWithCount: true
    ) {
      list {
        uuid
        name
        description
        type
        state
        accountQuotaInfo {
          volumeNum
          usages {
            name
            total
            used
          }
        }
        vmNum
        volumeNum
        role {
          uuid
          name
          type
        }
        roleFromAccountGroup {
          uuid
          name
          type
        }
        createDate
        lastOpDate
      }
      total
    }
  }
`;

export interface IAccountPlainListProps extends Omit<
  ITableListProps<IAccount>,
  "gql"
> {
  toolbar?: ITableListProps<IAccount>["toolbar"];
  gql?: DocumentNode;
  columnKeys?: Array<keyof IAccount>;
}

const AccountPlainList: React.FC<IAccountPlainListProps> = ({
  columnConfig,
  actionConfig,
  queryConfig,
  ...props
}) => {
  const defaultQueryConfig = useQueryConfig();
  const defaultActionConfig =
    useActionConfig() as unknown as ITableListProps<IAccount>["actionConfig"];
  const defaultColumnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig || defaultColumnConfig}
      actionConfig={actionConfig || defaultActionConfig}
      queryConfig={queryConfig || defaultQueryConfig}
      gql={props?.gql || ACCOUNT_LIST}
      type="AccountVO"
      resource="account.information"
      {...props}
    />
  );
};

export default AccountPlainList;
