import { useColumnConfig } from "@zstack/zsphere-engine/src/points-details";
import type { IOption } from "@zstack/zsphere-engine/src/points-details/useColumnConfig";
import type { PointsDetails as IPointsDetails } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";

export default () => {
  const option: IOption<IPointsDetails> = useMemo(
    () => [
      {
        key: "associated.resource.name",
        formatter: (value: IPointsDetails) => value?.resourceName,
      },
      {
        key: "type",
        formatter: (value: IPointsDetails) => value?.type,
      },
      {
        key: "activation.time",
        formatter: (value: IPointsDetails) => value?.activationTime,
      },
      {
        key: "expire.time",
        formatter: (value: IPointsDetails) => value?.expireTime,
      },
    ],
    [],
  );

  return useColumnConfig<IPointsDetails>(option);
};
