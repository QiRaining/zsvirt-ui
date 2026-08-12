import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SharedBlock } from "@zstack/zsphere-types/graphql";
import React from "react";

import BasicInfo from "./basic-info";

export interface IProps {
  current: SharedBlock;
}

export default function Overview({ current }: IProps) {
  const dataSet = React.useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: any) => <BasicInfo {...props} current={current} />,
      },
    };
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="shared-block"
      cols={1}
      dataSet={dataSet}
    />
  );
}
