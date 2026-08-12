import { Op, VmInstanceState } from "@zstack/zsphere-types";
import type { Image as IImage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import Vm from "../../../vm/list";

export interface IProps {
  current: IImage;
  refetch: Function;
}

const VmList: React.FC<IProps> = ({ current }) => {
  const vmDefaultQuery = useMemo(() => {
    const conditions = [
      {
        key: "state",
        op: Op.ne,
        value: VmInstanceState.Destroyed,
      },
      {
        key: "type",
        op: Op.eq,
        value: "UserVm",
      },
    ];

    if (current?.uuid) {
      conditions.push({
        key: "imageUuid",
        op: Op.eq,
        value: current?.uuid,
      });
    }

    return {
      conditions,
      count: true,
    };
  }, [current?.uuid]);

  return (
    <Vm
      source={current}
      customView="virtualization.custom"
      withResourceAttribute
      view="sub.virtualization.image"
      defaultQuery={vmDefaultQuery}
    />
  );
};

export default VmList;
