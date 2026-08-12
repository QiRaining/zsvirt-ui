import { hostBlockDevicesList } from "@zstack/virtualization-resource/src/gql/disk.gql";
import { TableList } from "@zstack/zsphere-components";
import type { HostBlockDevices } from "@zstack/zsphere-types/graphql";
import React from "react";

import useColumnConfig from "./config/useColumnConfig";

export interface IProps {
  current: HostBlockDevices;
  hostUuid: string;
}

export default function Partition({ current, hostUuid }: IProps) {
  const columnConfig = useColumnConfig();
  return (
    <TableList
      view="main"
      type="Partition"
      resource="partition"
      columnConfig={columnConfig}
      gql={hostBlockDevicesList}
      expandable={{ childrenColumnName: "null" }}
      rowKey="name"
      rowSelection={false}
      defaultQuery={{
        conditions: [
          { key: "hostUuid", value: hostUuid },
          {
            key: "__partition__",
            value: current.name,
          },
        ],
      }}
    />
  );
}
