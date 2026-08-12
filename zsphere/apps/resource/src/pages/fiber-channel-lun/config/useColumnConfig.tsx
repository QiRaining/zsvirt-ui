import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/fiber-channel-lun";
import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";

export default () => {
  return useColumnConfig<IFiberChannelLun>([
    {
      key: "name",
      render: ({ name }) => {
        return <Text>{name}</Text>;
      },
    },
    {
      key: "vm-instance.count",
      formatter: ({ scsiLunVmInstanceRefs = [] }) =>
        scsiLunVmInstanceRefs?.length || 0,
    },
    {
      key: "size",
      formatter: ({ size = 0 }) => formatStorage(size, 2),
    },
  ]);
};
