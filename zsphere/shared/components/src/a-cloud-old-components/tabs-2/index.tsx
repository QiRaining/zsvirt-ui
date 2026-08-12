import { TabPaneProps, Tabs as AntTabs } from "antd";

import "./style.less";
import { TabsProps } from "antd/es/tabs";
import cls from "classnames";
import toArray from "rc-util/lib/Children/toArray";
import React, { memo, useMemo } from "react";

import { getBaseCls } from "../../_utils/common";
import { AuthHander, useAuth } from "../auth";
import { IRouterByAuth } from "../auth/type";
import { usePersistTabState } from "./hooks/use-persist-tab-store";

const baseCls = getBaseCls("tabs");
const zsvCls = getBaseCls("tabs-zsv");

interface ITabPaneProps extends TabPaneProps {
  auth?: IRouterByAuth;
  tabKey?: string;
}

interface ParsedTabItem {
  key: string | undefined;
  node: React.ReactElement<ITabPaneProps>;
  auth?: IRouterByAuth;
  [key: string]: unknown;
}

function parseTabList(children: React.ReactNode): ParsedTabItem[] {
  const allNodes = toArray(children) as unknown as React.ReactElement[];
  const nodes = allNodes.filter(
    React.isValidElement,
  ) as React.ReactElement<ITabPaneProps>[];

  return nodes.map((node) => {
    const key = node.key !== undefined ? String(node.key) : undefined;

    return {
      ...node.props,
      key,
      node,
      auth: node.props.auth,
    } as ParsedTabItem;
  });
}

export const useAuthTabs = (list: ParsedTabItem[]) => {
  const { hasAuth } = useAuth();
  return useMemo(
    () => list.filter(({ auth }) => (auth ? hasAuth(auth) : true)),
    [hasAuth, list],
  );
};

const TabsComponent: React.FC<
  TabsProps & { contentId?: string; routerTarget?: string }
> = ({
  children,
  className,
  contentId = "main-tab",
  routerTarget,
  ...props
}) => {
  const listComputed = useAuthTabs(parseTabList(children));
  const { onChange, activeKey } = usePersistTabState(
    contentId,
    listComputed,
    routerTarget,
  );
  if (!listComputed.length) {
    return null;
  }

  // 使用新的 items API 替代 children
  const items = listComputed.map(({ node, auth }) => {
    const {
      tab,
      children: tabChildren,
      auth: _unusedAuth,
      tabKey: _unusedTabKey,
      ...restProps
    } = node.props;
    return {
      key: String(node.key ?? ""),
      label: auth ? <AuthHander {...auth}>{tab}</AuthHander> : tab,
      children: tabChildren,
      ...restProps,
    };
  });

  return (
    <AntTabs
      animated={false}
      className={cls(baseCls, zsvCls, className)}
      {...props}
      activeKey={activeKey}
      onChange={onChange}
      items={items as Parameters<typeof AntTabs>[0]["items"]}
    />
  );
};

TabsComponent.displayName = "Tabs";

export const Tabs = memo(TabsComponent);

const TabPaneComponent: React.FC<ITabPaneProps> = ({ ...props }) => (
  <AntTabs.TabPane {...props} />
);

TabPaneComponent.displayName = "TabPane";

export const TabPane = memo(TabPaneComponent);
