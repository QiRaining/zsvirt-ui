import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { EmailServerSetting as IEmailServerSetting } from "@zstack/zsphere-types/graphql";
import React from "react";

import BasicInfo from "./basic-info";

export interface IProps {
  current: IEmailServerSetting | {};
  refetch?: Function;
}

const Overview: React.FC<IProps> = ({ current }) => {
  const dataSet = React.useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo detail={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-administration-access-control-rule"
      cols={1}
      dataSet={dataSet}
    />
  );
};

export default Overview;
