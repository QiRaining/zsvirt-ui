import HostKernelInterfaceList from "@zstack/virtualization-resource/src/pages/host-kernel-interface/list";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import React from "react";

export interface IProps {
  current: HostVO;
}

const Zskernel: React.FC<IProps> = ({ current }) => {
  return (
    <HostKernelInterfaceList
      key={current?.uuid}
      source={current}
      view="main"
      defaultQuery={{
        conditions: [
          {
            key: "hostUuid",
            value: current?.uuid ?? "",
          },
        ],
      }}
    />
  );
};

export default Zskernel;
