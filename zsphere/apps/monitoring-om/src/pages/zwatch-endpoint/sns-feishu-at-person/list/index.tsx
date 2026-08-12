import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SNSFeiShuAtPerson } from "@zstack/zsphere-types/graphql";
import React from "react";

import { querySNSFeiShuAtPersonList } from "../../../../gql/zwatch-sns-at-person.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const SNSFeiShuAtPersonList: React.FC<IListProps<SNSFeiShuAtPerson>> = (
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
      gql={querySNSFeiShuAtPersonList}
      type="SNSFeiShuAtPerson"
      resource="sns.feishu.at.person"
      pagination
      {...props}
    />
  );
};

export default SNSFeiShuAtPersonList;
