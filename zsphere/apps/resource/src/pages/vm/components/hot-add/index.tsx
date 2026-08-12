import { guestOsCpuMemHotAddInfoList } from "@zstack/virtualization-resource/src/gql/image.gql";
import type { ITableListProps } from "@zstack/zsphere-components";
import { TableList } from "@zstack/zsphere-components";
import cls from "classnames";
import React from "react";

import useColumnConfig from "./config/useColumnConfig";
import useQueryConfig from "./config/useQueryConfig";

import style from "./style.module.less";

export default function HotAdd(props: Partial<ITableListProps<any>>) {
  const columnConfig = useColumnConfig();
  const queryConfig = useQueryConfig();

  return (
    <TableList
      {...props}
      className={cls(style.list, props.className)}
      view="main"
      gql={guestOsCpuMemHotAddInfoList}
      columnConfig={columnConfig}
      queryConfig={queryConfig}
      type="GuestOsCpuMemHotAddInfo"
      resource="GuestOsCpuMemHotAddInfo"
      toolbar={["search"]}
      rowSelection={false}
    />
  );
}
