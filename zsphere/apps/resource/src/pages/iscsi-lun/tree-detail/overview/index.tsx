import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import RelativeResource from "./relative-object";

interface IProps {
  current: IIscsiLun;
  hostUuid?: string;
}

const Overview: React.FC<IProps> = ({ current, hostUuid }) => {
  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo {...props} detail={current} hostUuid={hostUuid} />
        ),
      },
      relativeResource: {
        resourceKey: "relativeResource",
        x: 0,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource detail={current} {...props} />
        ),
      },
    };

    return result;
  }, [current, hostUuid]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-iscsi-lun"
      cols={1}
      dataSet={dataSet}
    />
  );
};

export default Overview;
