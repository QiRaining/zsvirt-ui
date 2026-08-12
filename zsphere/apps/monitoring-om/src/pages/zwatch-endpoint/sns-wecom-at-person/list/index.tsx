import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { SNSWeComAtPerson } from "@zstack/zsphere-types/graphql";
import React from "react";

import { querySNSWeComAtPersonList } from "../../../../gql/zwatch-sns-at-person.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const SNSWeComAtPersonList: React.FC<IListProps<SNSWeComAtPerson>> = (
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
      gql={querySNSWeComAtPersonList}
      type="SNSWeComAtPerson"
      resource="sns.wecom.at.person"
      pagination
      {...props}
    />
  );
};

export default SNSWeComAtPersonList;
