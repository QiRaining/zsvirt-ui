import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { CephMon as ICephMon } from "@zstack/zsphere-types/graphql";
import React from "react";

import { monsList } from "../../../gql/ceph-mon.gql";
import { useActionConfig, useQueryConfig, useColumnConfig } from "../config";

const List: React.FC<IListProps<ICephMon>> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={monsList}
      resource="ceph.mon"
      type="CephMon"
      {...props}
    />
  );
};

export default List;
