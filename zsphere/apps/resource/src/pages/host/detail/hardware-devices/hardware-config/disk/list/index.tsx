import { hostBlockDevicesList } from "@zstack/virtualization-resource/src/gql/disk.gql";
import { TableList } from "@zstack/zsphere-components";
import type { IListProps } from "@zstack/zsphere-types";
import type { HostBlockDevices } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useColumnConfig } from "../config";

import style from "../../style.module.less";

export interface IProps extends IListProps<HostBlockDevices> {
  title?: React.ReactNode;
}

export default function DiskList({ title, ...props }: IProps) {
  const columnConfig = useColumnConfig();

  return (
    <>
      {title && <div className={style.title}>{title}</div>}
      <TableList
        columnConfig={columnConfig}
        gql={hostBlockDevicesList}
        type="Disk"
        resource="disk"
        rowSelection={false}
        expandable={{ childrenColumnName: "null" }}
        rowKey="name"
        {...props}
      />
    </>
  );
}
