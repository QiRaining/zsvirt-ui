import { Op } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";

import Host from "../../../host/list";

export interface IProps {
  current: ICluster;
  refetch: Function;
}

const HostList: React.FC<IProps> = ({ current }) => {
  return (
    <Host
      source={current}
      customView="virtualization.custom"
      withResourceAttribute
      view="sub.virtualization.cluster"
      defaultQuery={{
        conditions: [
          {
            key: "clusterUuid",
            op: Op.eq,
            value: current.uuid,
          },
        ],
      }}
    />
  );
};

export default HostList;
