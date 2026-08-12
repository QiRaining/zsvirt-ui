import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";
import React from "react";

import { fiberChannelLunList } from "../../../gql/fiber-channel-lun.gql";
import useActionConfig from "../config/useActionConfig";
import useColumnConfig from "../config/useColumnConfig";
import useQueryConfig from "../config/useQueryConfig";

const FiberChannelLunList: React.FC<
  IListProps<IFiberChannelLun> &
    Pick<ITableListProps<IFiberChannelLun>, "toolbar">
> = (props) => {
  const queryConfig = useQueryConfig(props.defaultQuery);
  const actionConfig = useActionConfig();
  const columnConfig = useColumnConfig();

  return (
    <TableList
      columnConfig={columnConfig}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
      gql={fiberChannelLunList}
      type="FiberChannelLun"
      resource="fiber.channel.lun"
      pagination={false}
      rowSelection={false}
      {...props}
    />
  );
};

export default FiberChannelLunList;
