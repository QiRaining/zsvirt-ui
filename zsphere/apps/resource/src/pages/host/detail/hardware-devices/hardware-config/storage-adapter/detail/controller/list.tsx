import { nvmeTargetList } from "@zstack/virtualization-resource/src/gql/nvme-storage.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { NvmeTarget } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "./config/useColumnConfig";
import useQueryConfig from "./config/useQueryConfig";

export interface IProps extends IListProps<NvmeTarget> {}

export default function ControllerList({ ...props }: IProps) {
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  return (
    <TableList
      gql={nvmeTargetList}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      type="NvmeTarget"
      resource="nvme.target"
      rowSelection={false}
      {...props}
    />
  );
}
