import type { TabsProps as AntTabsProps } from "antd";
import { Tabs as AntTabs } from "antd";
import cls from "classnames";
import React, { useState, useRef, useImperativeHandle } from "react";
import { flushSync } from "react-dom";

import style from "./style.module.less";

export interface ITabsController {
  jumpToError: (err: any) => void;
}

export type TabsRef = React.Ref<ITabsController>;

export interface ITabsProp extends AntTabsProps {
  tabsRef?: TabsRef;
}

export default function Tabs({ tabsRef, ...tabsProps }: ITabsProp) {
  const [activeKey, setActiveKey] = useState(tabsProps.defaultActiveKey);
  const containerRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(
    tabsRef,
    () => ({
      jumpToError: () => {
        requestAnimationFrame(() => {
          if (containerRef.current) {
            const tabPanes =
              containerRef.current.querySelectorAll("[role=tabpanel]");
            const errorPane = [...tabPanes].find((item) =>
              item.querySelector(".ant-form-item-has-error"),
            );
            if (errorPane) {
              flushSync(() => {
                setActiveKey(errorPane.id.split("-panel-")[1]);
              });
              errorPane
                .querySelector(".ant-form-item-has-error")
                ?.scrollIntoView({ behavior: "instant" });
            }
          }
        });
      },
    }),
    [],
  );
  return (
    <div ref={containerRef}>
      <AntTabs
        {...tabsProps}
        type="line"
        className={cls(style.tab, tabsProps.className)}
        activeKey={activeKey}
        onChange={setActiveKey}
      />
    </div>
  );
}
