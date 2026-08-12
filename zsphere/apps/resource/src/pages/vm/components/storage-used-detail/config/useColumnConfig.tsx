import { Text } from "@zstack/design";
import { Progress } from "@zstack/zsphere-components";
import useColumnConfig from "@zstack/zsphere-engine/src/storage-used/useColumnConfig";
import type { CapacityManagementListVMDiskInfo } from "@zstack/zsphere-types/graphql";
import { formatBytesToSize } from "@zstack/zsphere-utils";
import React from "react";

export default () => {
  return useColumnConfig<CapacityManagementListVMDiskInfo>([
    {
      key: "diskPartition",
      render: (current) => {
        return <Text>{current?.diskDeviceLetter}</Text>;
      },
    },
    {
      key: "mountPoint",
      render: (current) => {
        return <Text>{current?.mountPoint}</Text>;
      },
    },
    {
      key: "capacity.usage",
      render: (current) => {
        return (
          <Progress.Bar
            format={false}
            percent={(current?.percent ?? 0).toFixed(2)}
          />
        );
      },
    },
    {
      key: "used.quantity",
      render: (current) => {
        return <Text>{formatBytesToSize(current?.used)}</Text>;
      },
    },
    {
      key: "totalQuantity",
      render: (current) => {
        return <Text>{formatBytesToSize(current?.total)}</Text>;
      },
    },
  ]);
};
