import { Op, VmInstanceState } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";

import Vm from "../../../vm/list";

export interface IProps {
  current: ICluster;
  refetch: Function;
}

const VmList: React.FC<IProps> = ({ current }) => {
  return (
    <Vm
      source={current}
      customView="virtualization.custom"
      withResourceAttribute
      view="sub.virtualization"
      defaultQuery={{
        conditions: [
          {
            key: "cluster.uuid",
            op: Op.eq,
            value: current.uuid,
          },
          {
            key: "state",
            op: Op.ne,
            value: VmInstanceState.Destroyed,
          },
        ],
      }}
    />
  );
};

export default VmList;
