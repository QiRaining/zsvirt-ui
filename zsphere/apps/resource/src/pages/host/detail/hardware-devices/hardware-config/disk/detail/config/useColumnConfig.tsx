import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/partition";
import type { HostBlockDevices } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";

import Progress from "./progress";

export default () => {
  return useColumnConfig<HostBlockDevices>([
    {
      key: "name",
      width: 80,
      formatter: (current) => current.name.split("/").pop(),
    },
    {
      key: "size",
      width: 100,
      formatter: (current) => formatStorage(current.size ?? 0, 2),
    },
    {
      key: "FSType",
      width: 110,
      formatter: (current) => current.fsType?.replace(/_/g, " "),
    },
    {
      key: "mountPoint",
      width: 80,
    },
    {
      key: "usedRatio",
      width: 206,
      minWidth: 120,
      render: (current) => {
        if (!current.mountPoint) {
          return <ResourceName />;
        }
        return (
          <Progress
            size={current.size}
            used={current.used}
            available={current.available}
            usedRatio={current.usedRatio}
          />
        );
      },
    },
  ]);
};
