import { useLocalStorageState } from "ahooks";
import React from "react";

import { getBaseCls } from "../_utils/common";

import "./style.less";

const baseCls = getBaseCls("app-layout");

const RESIZABLE_SIZE_KEY = "leftNavWidth";

const DEFAULT_WIDTH = 240;

const leftNavCls = `${baseCls}-left-nav`;

interface ILeftNavResizable {
  children: React.ReactNode;
}

export function LeftNavResizable({ children }: ILeftNavResizable) {
  const [resizableSize, setResizableSize] = useLocalStorageState<
    Record<string, number>
  >("resizableSize", {
    [RESIZABLE_SIZE_KEY]: DEFAULT_WIDTH,
  });

  return <div className={leftNavCls}>{children}</div>;
}
