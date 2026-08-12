import { Icon } from "@zstack/design";
import { useRegisterCommand, useSetTab } from "@zstack/zsphere-components";
import { ResizableLayout } from "@zstack/zsphere-design-biz";
import { LeftNavType, NavView } from "@zstack/zsphere-types";
import type { IMenu } from "@zstack/zsphere-types";
import cls from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { useBreakpoint } from "../../hooks/use-breakpoint";
import { usePersistTreeStatus } from "../../hooks/use-persist-tree-state";
import { getTreeKey } from "../../utils/tree-utils";
import MenuList from "./components/menu-list";
import { useMenuTree } from "./use-menu-tree";

import style from "./nav-style.module.less";

interface IMenuDisplay extends IMenu {
  highlight: boolean;
}

// 常量定义
const DEFAULT_WIDTH = 160;
const MIN_WIDTH = 120;
const MAX_WIDTH = 320;
const RESIZABLE_SIZE_KEY = "leftMenuWidth";
const MENU_EXPAND_KEY = "dashboard-menu-expand";

// 自定义 Hook：处理菜单展开状态（断点驱动）
// compact(<1024): 强制折叠; medium(1024-1279): 默认折叠，可手动展开; standard/wide(≥1280): 默认展开
const useMenuExpand = () => {
  const bp = useBreakpoint();

  const getDefaultExpand = useCallback(() => {
    if (bp === "compact") {
      return false;
    }
    if (bp === "medium") {
      const stored = window.localStorage.getItem(MENU_EXPAND_KEY);
      // medium 下没有历史记录时默认折叠
      return stored === null ? false : stored === "true";
    }
    // standard / wide 默认展开
    return true;
  }, [bp]);

  const [expand, updateExpand] = useState<boolean>(getDefaultExpand);

  // 断点变化时自动更新展开态
  useEffect(() => {
    if (bp === "compact") {
      updateExpand(false);
    } else if (bp === "medium") {
      const stored = window.localStorage.getItem(MENU_EXPAND_KEY);
      updateExpand(stored === null ? false : stored === "true");
    } else {
      updateExpand(true);
    }
  }, [bp]);

  const toggleExpand = useCallback(() => {
    // compact 下禁止手动展开
    if (bp === "compact") {
      return;
    }
    const newExpand = !expand;
    updateExpand(newExpand);
    window.localStorage.setItem(MENU_EXPAND_KEY, String(newExpand));
  }, [expand, bp]);

  return { expand, toggleExpand };
};

// 主组件
export const LeftNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setTab } = useSetTab();
  const { expand, toggleExpand } = useMenuExpand();
  const [resizing, setResizing] = useState(false);
  const { menus: _menus } = useMenuTree();
  const { getTreeStatus } = usePersistTreeStatus();

  const handleDispatchEvent = useCallback(() => {
    if (window.dispatchEvent) {
      const event = new Event("resize");
      window.dispatchEvent(event);
    }
  }, []);

  useEffect(() => handleDispatchEvent(), [handleDispatchEvent]);

  // 注册命令
  useRegisterCommand({
    id: "navigate.virtualization.resource.submenu",
    fn: (key: LeftNavType | undefined) => {
      if (!key || !Object.values(LeftNavType).includes(key as LeftNavType)) {
        return;
      }
      const leftNav = key as LeftNavType;
      const navView = (sessionStorage.getItem(`${leftNav}-virRscNavView`) ||
        NavView.Resource) as NavView;
      const treeStatus = getTreeStatus({ key: getTreeKey(leftNav, navView) });

      sessionStorage.setItem(`${leftNav}-virRscNavView`, navView);
      sessionStorage.setItem("resource_active_left_nav", leftNav);

      if (treeStatus.selectedResource) {
        navigate(
          `/virtualization-resource/${treeStatus.selectedResource}/detail?uuid=${treeStatus.selectedKey}&leftnav=${leftNav}&navView=${navView}`,
        );
      } else {
        navigate(
          `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`,
        );
      }
    },
  });

  useRegisterCommand({
    id: "view.alarm.message",
    fn: () => {
      navigate("/virtualization-monitoring-om/alarm-message");
    },
  });

  useRegisterCommand({
    id: "navigate.recycle",
    fn: () => {
      (window as any).needClearTab = false;
      setTab(
        "main-tab",
        "recycle",
        "/virtualization-resource/root-node/detail",
      );
      const search = new URLSearchParams(location.search);
      const leftNav = search.get("leftnav") ?? LeftNavType.ClusterHost;
      const navView = search.get("navView") ?? NavView.Resource;
      navigate(
        `/virtualization-resource/root-node/detail?uuid=-1&leftnav=${leftNav}&navView=${navView}`,
      );
    },
  });

  const menus = useMemo(() => {
    return _menus.map((item: IMenuDisplay) => ({
      ...item,
      highlight:
        item.key ===
          location.pathname
            .split("/")?.[1]
            ?.replace(new RegExp("-", "g"), ".") ||
        (item.key === "virtualization.monitoring.om" &&
          location.pathname.includes("/zmigrate")),
    }));
  }, [location.pathname, _menus]);

  if (expand) {
    return (
      <div
        className={cls(style["dashboard-left-expand"], {
          [style["resizing-active"]]: resizing,
        })}
      >
        <ResizableLayout
          storageKey={RESIZABLE_SIZE_KEY}
          defaultSize={DEFAULT_WIDTH}
          minSize={MIN_WIDTH}
          maxSize={MAX_WIDTH}
          direction="horizontal"
          resizeEdge="right"
          onResizingChange={setResizing}
          onResizeStop={handleDispatchEvent}
        >
          <div>
            <div
              className={style["menu-arrow"]}
              onClick={toggleExpand}
              role="none"
            >
              <Icon type="arrowhead-left" />
            </div>
            <MenuList menus={menus} isExpand={expand} />
          </div>
        </ResizableLayout>
      </div>
    );
  }

  return (
    <div
      className={style["dashboard-left"]}
      style={{ width: expand ? "160px" : "46px" }}
    >
      <div className={style["menu-arrow"]} onClick={toggleExpand} role="none">
        <Icon type="arrowhead-right" />
      </div>
      <MenuList menus={menus} isExpand={expand} />
    </div>
  );
};
