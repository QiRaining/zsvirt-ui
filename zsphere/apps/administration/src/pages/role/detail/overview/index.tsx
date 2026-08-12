import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { ZsvRole as IZsvRole } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import UIPrivilegeInfo from "./ui-privilege-info";

interface IProps {
  current: IZsvRole;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo {...props} refetch={refetch} detail={current} />
        ),
      },
      uiAuthInfo: {
        resourceKey: "uiAuthInfo",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <UIPrivilegeInfo {...props} refetch={refetch} detail={current} />
        ),
      },
    };
    return result;
  }, [current]);

  return (
    <div className="zsv-detail-container">
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="zsv-role"
        cols={2}
        dataSet={dataSet}
      />
    </div>
  );
};

export default Overview;
