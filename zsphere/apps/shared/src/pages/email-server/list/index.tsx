import { gql } from "@apollo/client";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import { useColumnConfig, useQueryConfig } from "../config";

const emailServerSettingList = gql`
  query emailServerSettingList(
    $conditions: [Condition!]
    $extraConditions: [Condition!]
    $start: Int
    $limit: Int
    $sortBy: String
    $type: String
    $sortDirection: SortDirectionValidValues
  ) {
    emailServerSettingList(
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
        state
        type
        description
        createDate
        toPublic
        shareType
        owner {
          name
          uuid
        }
        emailPlat {
          password
          username
          smtpPort
          smtpServer
        }
      }
    }
  }
`;

const EmailServerSettingList: React.FC<IListProps<IEmailServerSetting>> = ({
  view,
  helper,
  defaultQuery = {},
  selectType = "checkbox",
  columnKeys = [],
  onClickName,
  ...props
}) => {
  const intl = useIntl();
  const queryConfig = useQueryConfig();
  const columnConfig = useColumnConfig({ view, onClickName });

  const helperMemo: ITableListProps<IEmailServerSetting>["helper"] = useMemo(
    () => ({
      authKey: "create.emailServerSetting",
      text: intl.formatMessage({
        id: "emailServer.hepler",
        defaultMessage: "No available email servers.",
      }),
      microAppName: "settings",
      to: "/email-server/create",
      ...helper,
    }),
    [intl, helper],
  );

  return (
    <TableList
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      gql={emailServerSettingList}
      type="EmailServerSetting"
      resource="email.server"
      rowKey="uuid"
      helper={helperMemo}
      defaultQuery={defaultQuery}
      selectType={selectType}
      columnKeys={columnKeys}
      view={view}
      {...props}
    />
  );
};

export default EmailServerSettingList;
