import { ResourceName } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/baremetal-cluster";
import { ClusterState as IClusterState } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import qs from "qs";
import React from "react";

export default () => {
  const searchObj = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const navView = (searchObj?.navView as string) || "notGroup";

  return useColumnConfig<ICluster>([
    {
      key: "name",
      render: (current: ICluster) => {
        return (
          <ResourceName
            value={current?.name}
            link={{
              to: `/baremetal-cluster`,
              microAppName: "virtualization-resource",
              uuid: current?.uuid,
              leftnav: LeftNavType.BareMetal,
              navView,
              keepState: false,
            }}
          />
        );
      },
    },
    {
      key: "state",
      filterOptions: IClusterState,
    },
  ]);
};
