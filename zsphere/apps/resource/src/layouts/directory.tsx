import { ResizableLayout } from "@zstack/zsphere-design-biz";
import React, { useState } from "react";

import { useUrlParamsWatcher } from "./hooks/use-url-params-watcher";
import ResourceTree from "./resource-tree";
import QuickLink from "./resource-tree/components/quick-link";
import SelectLeftNav from "./select-left-nav";

import style from "./style.module.less";

interface IProps {
  parentResizing: boolean;
}

const RESIZABLE_SIZE_KEY = "leftNavSelectLeftNavHeight";

const DEFAULT_HEIGHT = 220;

const ResourceDirMenu: React.FC<IProps> = ({ parentResizing }) => {
  const { leftNav: activeKey } = useUrlParamsWatcher();
  const [resizing, setResizing] = useState(false);

  return (
    <div
      className={`${style["resource-dir-menu"]} ${
        parentResizing ? style["resource-dir-menu-resizing-active"] : ""
      }`}
    >
      <ResizableLayout
        storageKey={RESIZABLE_SIZE_KEY}
        defaultSize={DEFAULT_HEIGHT}
        minSize={100}
        maxSize={240}
        direction="vertical"
        resizeEdge="bottom"
        onResizingChange={setResizing}
      >
        <SelectLeftNav parentResizing={resizing} activeKey={activeKey} />
      </ResizableLayout>
      <ResourceTree activeKey={activeKey} />
      <QuickLink />
    </div>
  );
};

export default React.memo(ResourceDirMenu);
