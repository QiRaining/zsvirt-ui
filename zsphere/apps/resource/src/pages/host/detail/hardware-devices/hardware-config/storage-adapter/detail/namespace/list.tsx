import { nvmeLunList } from "@zstack/virtualization-resource/src/gql/nvme-lun.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { NVMeLun } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "./config/useColumnConfig";
import useQueryConfig from "./config/useQueryConfig";

export interface IProps extends IListProps<NVMeLun> {}

export default function NamespaceList({ ...props }: IProps) {
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  return (
    <TableList
      gql={nvmeLunList}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      type="NVMeLun"
      resource="nvme.lun"
      rowSelection={false}
      {...props}
    />
  );
}
