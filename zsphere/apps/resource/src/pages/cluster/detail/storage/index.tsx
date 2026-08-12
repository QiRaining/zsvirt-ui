import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import { Op } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

export interface IProps {
  current: ICluster;
  refetch: Function;
}

const StorageList: React.FC<IProps> = ({ current }) => {
  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "cluster.uuid",
          value: current.uuid,
          op: Op.eq,
        },
      ],
    }),
    [current],
  );

  return (
    <PrimaryStorageList
      view="sub.virtualization.cluster"
      customView="custom"
      withResourceAttribute
      defaultQuery={defaultQuery}
      source={current}
    />
  );
};

export default StorageList;
