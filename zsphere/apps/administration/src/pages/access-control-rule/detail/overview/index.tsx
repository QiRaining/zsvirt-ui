import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout, Action } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { AccessControlRule as IAccessControlRule } from "@zstack/zsphere-types/graphql";
import React from "react";

import { useActionConfig } from "../../config";
import BasicInfo from "./basic-info";

export interface IProps {
  current: IAccessControlRule;
  refetch?: Function;
}

const STYLE_MARGIN_BOTTOM_8 = { marginBottom: 8 } as const;

const Overview: React.FC<IProps> = ({ current }) => {
  const { list: actionList, viewMap } = useActionConfig();
  const memoizedSelectedList = React.useMemo(() => [current], [current]);

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
    <>
      <div style={STYLE_MARGIN_BOTTOM_8}>
        <Action
          view="main.virtualization"
          position="header"
          menuList={actionList}
          viewMap={viewMap}
          selectedList={memoizedSelectedList}
        />
      </div>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="virtualization-administration-access-control-rule"
        cols={1}
        dataSet={dataSet}
      />
    </>
  );
};

export default Overview;
