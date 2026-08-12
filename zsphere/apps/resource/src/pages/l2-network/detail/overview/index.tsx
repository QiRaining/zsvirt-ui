import type { IDraggableCardProps } from "@zstack/zsphere-components";
import { useAuth } from "@zstack/zsphere-components";
import {
  ResponsiveDndCardsLayout,
  TagAndAttribute,
} from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { L2Network as IL2Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import NicConfig from "./nic-config";
import RelativeObject from "./related-object";

import style from "./style.module.less";

interface IProps {
  current: IL2Network;
  refetch?: any;
}

const Overview: React.FC<IProps> = ({ current, refetch }) => {
  const { hasAuth } = useAuth();

  const dataSet = useMemo(() => {
    const result: any = {
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <BasicInfo {...props} current={current} />
        ),
      },
      relatedResource: {
        resourceKey: "relatedResource",
        x: 1,
        y: 0,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <RelativeObject {...props} current={current} />
        ),
      },
      nicConfig: {
        resourceKey: "nicConfig",
        x: 1,
        y: 1,
        node: (props: Omit<IDraggableCardProps, "detail">) => (
          <NicConfig {...props} current={current} refetch={refetch} />
        ),
      },
      ...(hasAuth({
        type: "block",
        resource: "virtualization.tag.and.attribute",
        authKey: "resource.attribute",
      }) && {
        tagAndAttribute: {
          resourceKey: "tagAndAttribute",
          x: 1,
          y: 2,
          node: (props: Omit<IDraggableCardProps, "detail">) => {
            return (
              <TagAndAttribute current={current} {...props} showTag={false} />
            );
          },
        },
      }),
    };
    return result;
  }, [current]);

  return (
    <div className={style.container}>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="network-resource-l2network"
        cols={2}
        dataSet={dataSet}
      />
    </div>
  );
};

export default Overview;
