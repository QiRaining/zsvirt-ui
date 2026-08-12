import PrimaryStorageList from "@zstack/virtualization-resource/src/pages/primary-storage/list";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { Zone as IZone } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

interface IProps {
  current: IZone;
}

const DataStorage: React.FC<IProps> = ({ current }) => {
  const primaryStorageDefaultQuery = useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [];

    if (current?.uuid) {
      conditions.push({
        key: "zoneUuid",
        value: current.uuid,
        op: Op.eq,
      });
    }

    return {
      conditions,
    };
  }, [current?.uuid]);

  return (
    <PrimaryStorageList
      source={current}
      view="sub.virtualization.zone"
      customView="custom"
      withResourceAttribute
      defaultQuery={primaryStorageDefaultQuery}
    />
  );
};

export default DataStorage;
