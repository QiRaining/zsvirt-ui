import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SNSDingTalkAtPerson } from "@zstack/zsphere-types/graphql";
import React from "react";

import { querySNSDingTalkAtPersonList } from "../../../../gql/zwatch-sns-at-person.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const SNSDingTalkAtPersonList: React.FC<IListProps<SNSDingTalkAtPerson>> = (
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
      gql={querySNSDingTalkAtPersonList}
      type="SNSDingTalkAtPerson"
      resource="sns.dingtalk.at.person"
      pagination
      {...props}
    />
  );
};

export default SNSDingTalkAtPersonList;
