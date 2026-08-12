import { iscsiTargetList } from "@zstack/virtualization-resource/src/gql/iscsi-server.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { IscsiTargetInventory } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "./config/useColumnConfig";
import useQueryConfig from "./config/useQueryConfig";

export interface IProps extends IListProps<IscsiTargetInventory> {}

export default function IscsiTargetList({ ...props }: IProps) {
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig(props.defaultQuery);

  return (
    <TableList
      gql={iscsiTargetList}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      type="IscsiTarget"
      resource="iscsi.target"
      rowSelection={false}
      {...props}
    />
  );
}
