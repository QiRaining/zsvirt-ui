import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CbdMds as ICbdMds } from "@zstack/zsphere-types/graphql";
import React from "react";

import { mdsList } from "../../../gql/zbs-mds.gql";
import { useQueryConfig, useColumnConfig, useActionConfig } from "../config";

const List: React.FC<IListProps<ICbdMds>> = (props) => {
  const actionConfig = useActionConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);
  const columnConfig = useColumnConfig();

  return (
    <TableList
      rowKey="name"
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={mdsList}
      resource="zbs.mds"
      type="ZbsMds"
      {...props}
    />
  );
};

export default List;
