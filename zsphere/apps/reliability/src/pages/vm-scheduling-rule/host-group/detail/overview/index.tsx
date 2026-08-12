import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { useActionSubscribe } from "@zstack/zsphere-hooks";
import { ProfileType } from "@zstack/zsphere-types";
import type { HostGroup } from "@zstack/zsphere-types/graphql";
import type { FC } from "react";
import { useMemo } from "react";

import BasicInfo from "./basic-info";
import RelativeResource from "./relative-object";

interface IProps {
  current: HostGroup;
  refetch?: any;
}

const Overview: FC<IProps> = ({ current, refetch }) => {
  useActionSubscribe({
    resourceTypeList: ["HostGroup"],
    onFinish() {
      refetch?.();
    },
  });

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
      relativeResource: {
        resourceKey: "relativeResource",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeResource detail={current} {...props} />
        ),
      },
    };
  }, [current]);

  return (
    <ResponsiveDndCardsLayout
      profileType={ProfileType.OverviewLayoutConfig}
      resourceType="virtualization-reliability-host-group"
      cols={2}
      dataSet={dataSet}
    />
  );
};

export default Overview;
