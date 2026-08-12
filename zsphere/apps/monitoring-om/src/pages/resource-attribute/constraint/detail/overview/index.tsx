import { ResponsiveDndCardsLayout, Action } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../../config/useActionConfig";
import BasicInfo from "./basic-info";
import List from "./related-resource";

import style from "./style.module.less";

export interface IProps {
  current?: ResourceAttributeConstraint;
  onDelete?: () => void;
}

export default function Overview({ current, onDelete }: IProps) {
  const { getItemName, list, viewMap } = useActionConfig();

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
        <div className={style.actionWrapper}>
          <Action
            view="main"
            position="header"
            menuList={list}
            viewMap={viewMap}
            getItemName={getItemName}
            selectedList={current ? [current] : []}
            source={{ uuid: current?.keyUuid, onDelete }}
          />
        </div>
        <ResponsiveDndCardsLayout
          profileType={ProfileType.OverviewLayoutConfig}
          resourceType="resource.attribute.constraint"
          cols={1}
          dataSet={dataSet}
        />
      </div>
      <List current={current} />
    </>
  );
}
