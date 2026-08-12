import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { FiberChannelLun as IFiberChannelLun } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import BasicInfo from "./basic-info";
import RelativeResource from "./relative-object";

interface IProps {
  current: IFiberChannelLun;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current }) => {
  const _intl = useIntl();

  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo {...props} detail={current} />
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
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-fiber-channel-lun"
      cols={1}
      dataSet={dataSet}
    />
  );
};

export default Overview;
