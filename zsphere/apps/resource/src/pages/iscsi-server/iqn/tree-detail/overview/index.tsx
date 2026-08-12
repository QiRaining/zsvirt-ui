import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import BasicInfo from "./basic-info";
import RelativeResource from "./relative-object";

interface IProps {
  current: IIscsiServer;
  iscsiTargetUuid: string;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, iscsiTargetUuid }) => {
  const _intl = useIntl();

  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo
            {...props}
            detail={current}
            iscsiTargetUuid={iscsiTargetUuid!}
          />
        ),
      },
      relativeResource: {
        resourceKey: "relativeResource",
        x: 0,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource
            detail={current}
            {...props}
            iscsiTargetUuid={iscsiTargetUuid!}
          />
        ),
      },
    };

    return result;
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-resource-iscsi-iqn"
      cols={1}
      dataSet={dataSet}
    />
  );
};

export default Overview;
