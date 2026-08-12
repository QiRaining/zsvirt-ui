import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { SecurityGroup } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import RuleList from "./rule-list";

interface IProps {
  current: SecurityGroup;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current }) => {
  const dataSet = useMemo(() => {
    return {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo detail={current} {...props} />
        ),
      },
      ruleList: {
        resourceKey: "ruleList",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RuleList detail={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <div className="zsv-detail-container">
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-resource-securityGroup"
        cols={1}
        dataSet={dataSet}
        isDraggable={false}
      />
    </div>
  );
};

export default Overview;
