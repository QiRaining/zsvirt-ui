import { Text } from "@zstack/design";
import { Tabs } from "antd";
import type { TabsProps } from "antd/es/tabs";
import React from "react";

import style from "./style.module.less";

export interface ITabsTitleProps {
  leftTitle: string;
  leftBlock?: React.ReactNode;
  leftWidht?: number;
  rightTitle: string;
  rightBlock?: React.ReactNode;
}

const _TabsTitle: React.FC<ITabsTitleProps> = ({
  leftTitle,
  leftBlock,
  leftWidht = 320,
  rightTitle,
  _rightBlock,
}) => {
  return (
    <div className={style.header}>
      <div className={style.left} style={leftWidht ? { width: leftWidht } : {}}>
        <div className={style.title}>{leftTitle}</div>
        {leftBlock}
      </div>
      <div className={style.right}>
        <div className={style.title}>{rightTitle}</div>
      </div>
    </div>
  );
};

export interface IProps extends TabsProps {
  titleConfig?: ITabsTitleProps;
  items: {
    key: string;
    closable: boolean;
    label: React.ReactNode;
    children: React.ReactNode;
  }[];
}

const TabsConfig: React.FC<IProps> = ({
  titleConfig = {},
  items,
  ...props
}) => {
  return (
    <div className={style["tabs-container"]}>
      <Tabs
        hideAdd
        tabPosition="left"
        {...props}
        className={style.tab}
        tabBarStyle={
          titleConfig.leftWidht ? { width: titleConfig.leftWidht } : undefined
        }
      >
        {items.map((it) => (
          <Tabs.TabPane
            forceRender
            className={style.tabPane}
            tab={<Text>{it.label}</Text>}
            key={it.key}
          >
            {it.children}
          </Tabs.TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default TabsConfig;
