import VmList from "@zstack/virtualization-resource/src/pages/vm/list";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

interface IProps {
  current: Partial<IFiberChannelLun>;
}

const LunHostList: React.FC<IProps> = ({ current }) => {
  const vmDefaultQuery = useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [
      {
        key: "state",
        op: Op.ne,
        value: "Destroyed",
      },
      {
        key: "type",
        op: Op.eq,
        value: "UserVm",
      },
      {
        key: "scsiLunUuid",
        op: Op.eq,
        value: current?.uuid,
      },
      // {
      //   key: 'uuid',
      //   op: Op.in,
      //   values: _.compact(_.map(current?.scsiLunVmInstanceRefs || [], it => it?.vmInstanceUuid))
      // }
    ];

    return {
      conditions,
    };
  }, [current?.scsiLunVmInstanceRefs]);

  return (
    <VmList
      view="sub.virtualization.fiber-channel-lun"
      source={current}
      defaultQuery={vmDefaultQuery}
    />
  );
};

export default LunHostList;
