import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { PreconfigurationTemplate as IPreconfigurationTemplate } from "@zstack/zsphere-types/graphql";
import React from "react";

import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";

interface IProps {
  current: IPreconfigurationTemplate;
}

const Overview: React.FC<IProps> = ({ current }) => {
  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.TableColumnWidth}
      resourceType="pre-config-template-overview"
      cols={1}
      dataSet={{
        basicInfo: {
          resourceKey: "basicInfo",
          x: 0,
          y: 0,
          node: (props: Omit<IDraggableCardProps, "current">) => (
            <BasicInfo current={current} {...props} />
          ),
        },
        configInfo: {
          resourceKey: "configInfo",
          x: 0,
          y: 1,
          node: (props: Omit<IDraggableCardProps, "current">) => (
            <ConfigInfo current={current} {...props} />
          ),
        },
      }}
    />
  );
};

export default Overview;
