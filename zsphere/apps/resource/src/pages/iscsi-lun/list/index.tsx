import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";
import React from "react";

import { iscsiLunList } from "../../../gql/iscsi-lun.gql";
import { useActionConfig, useColumnConfig, useQueryConfig } from "../config";

const IscsiLunList: React.FC<IListProps<IIscsiLun>> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={iscsiLunList}
      type="IscsiLun"
      resource="iscsi.lun"
      {...props}
    />
  );
};

export default IscsiLunList;
