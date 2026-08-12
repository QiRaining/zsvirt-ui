// import React from 'react'
import { useColumnConfig } from "@zstack/zsphere-engine/src/fiber-channel-storage";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<IFiberChannelStorage>([
    {
      key: "scsi-lun.count",
      formatter: ({ fiberChannelLuns = [] }) => fiberChannelLuns?.length || 0,
    },
  ]);
};
