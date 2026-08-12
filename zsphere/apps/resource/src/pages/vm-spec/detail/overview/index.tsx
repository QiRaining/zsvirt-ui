import { ResponsiveDndCardsLayout, Action } from "@zstack/zsphere-components";
import { ProfileType } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import useActionConfig from "../../config/useActionConfig";
import BasicInfo from "./basic-info";
import ConfigInfo from "./config-info";

import style from "./style.module.less";

export interface IProps {
  current?: VmCustomSpecification;
}

export default function Overview({ current }: IProps) {
  const { list, viewMap } = useActionConfig();

  const dataSet = useMemo(
    () => ({
      basicInfo: {
        resourceKey: "basicInfo",
        x: 0,
        y: 0,
        node: (props: any) => <BasicInfo current={current} {...props} />,
      },
      configInfo: {
        resourceKey: "configInfo",
        x: 0,
        y: 1,
        node: (props: any) => <ConfigInfo current={current} {...props} />,
      },
    }),
    [current],
  );

  const selectedListCurrent = useMemo(() => [current], [current]);

  return (
    <>
      <div className={style.header}>
        <Action
          menuList={list}
          viewMap={viewMap}
          selectedList={selectedListCurrent}
          view="main"
          position="header"
          resource="vm.spec"
        />
      </div>
      <ResponsiveDndCardsLayout
        profileType={ProfileType.OverviewLayoutConfig}
        resourceType="vm-spec"
        cols={1}
        dataSet={dataSet}
      />
    </>
  );
}
