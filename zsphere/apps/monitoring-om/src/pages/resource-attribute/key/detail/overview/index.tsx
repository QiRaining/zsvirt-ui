import { ResponsiveDndCardsLayout } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import BasicInfo from "./basic-info";
import List from "./constraint";

import style from "./style.module.less";

export interface IProps {
  current?: ResourceAttributeKey;
}

export default function Overview({ current }: IProps) {
  const dataSet = useMemo(
    () => ({
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: any) => <BasicInfo current={current} {...props} />,
      },
    }),
    [current],
  );

  return (
    <>
      <div className={style.cardWrapper}>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="resource.attribute.key"
          cols={1}
          dataSet={dataSet}
        />
      </div>
      <List current={current} />
    </>
  );
}
