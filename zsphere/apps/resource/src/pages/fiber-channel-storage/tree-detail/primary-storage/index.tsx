import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { FiberChannelStorage as IFiberChannelStorage } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

interface IProps {
  current: Partial<IFiberChannelStorage>;
}

const PSList: React.FC<IProps> = ({ current }) => {
  const primaryStorageDefaultQuery = useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [
      {
        key: "__FiberChannelStorageUuids__",
        op: Op.eq,
        value: current?.uuid,
      },
    ];

    return {
      conditions,
    };
  }, [current?.uuid]);

  return (
    <PrimaryStorageList
      source={current}
      view="sub.virtualization.fiber-channel-storage"
      defaultQuery={primaryStorageDefaultQuery}
    />
  );
};

export default PSList;
