import VMList from "@zstack/virtualization-resource/src/pages/vm/list";
import { Op, VmInstanceState } from "@zstack/zsphere-types";
import React from "react";

export interface IProps {
  current: any;
}

const SubVMList: React.FC<IProps> = ({ current }) => {
  return (
    <VMList
      source={current}
      view="sub.virtualization.host"
      customView="virtualization.custom"
      withResourceAttribute
      defaultQuery={{
        conditions: [
          {
            key: "hostUuid",
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

export default SubVMList;
