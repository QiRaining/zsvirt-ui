import { Tabs as AntTabs } from "antd";
import { TabsProps, TabPaneProps } from "antd/lib/tabs";
import cls from "classnames";
import toArray from "rc-util/lib/Children/toArray";
import React, { useMemo } from "react";

import { getBaseCls } from "../../_utils/common";
import {
  useRouterByAuth,
  useAuthInfoContext,
  AuthInfoContext,
  AuthHander,
} from "../auth";
import { IRouterByAuth } from "../auth/type";

import "./style.less";

const baseCls = getBaseCls("tabs");
const zsvCls = getBaseCls("tabs-zsv");

function parseTabList(children: React.ReactNode): any[] {
  return toArray(children)
    .map((node: React.ReactElement<ITabPaneProps>) => {
      if (React.isValidElement(node)) {
        const key = node.key !== undefined ? String(node.key) : undefined;

        return {
          ...node.props,
          key,
          node,
          auth: node.props.auth,
        };
      }

      return null;
    })
    .filter((tab) => tab);
}

export const TabContext = React.createContext({
  setActiveKey: (key: string) => {},
});

export const Tabs: React.FC<TabsProps> = ({
  children,
  className,
  ...props
}) => {
  const { activeKey, listComputed, onChange } = useRouterByAuth(
    parseTabList(children),
  );
  const context = useMemo(() => ({ setActiveKey: onChange }), []);

  /**
   * 监听 activeKey ，触发 外部OnChange 事件
   * Tabs组件监听了history的location，会覆盖从props 到 AntTabs的activeKey
   * 使用useRouterByAuth 计算的 activeKey，在刷新的时候外部不能拿到正确的activeKey
   */
  React.useEffect(() => {
    props.onChange?.(activeKey);
  }, [activeKey, props]);

  if (!listComputed.length) {
    return null;
  }

  // 使用新的 items API 替代 children
  const items = useMemo(() => {
    return listComputed.map(({ node, auth }) => {
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
  }, [listComputed]);

  return (
    <TabContext.Provider value={context}>
      <AntTabs
        animated={false}
        className={cls(baseCls, zsvCls, className)}
        {...props}
        activeKey={activeKey}
        onChange={(v) => {
          onChange(v);
        }}
        items={items as Parameters<typeof AntTabs>[0]["items"]}
      />
    </TabContext.Provider>
  );
};

interface ITabPaneProps extends TabPaneProps {
  auth?: IRouterByAuth;
  tabKey?: string;
}

export const TabPane: React.FC<ITabPaneProps> = ({
  tabKey,
  auth,
  ...props
}) => {
  const { value } = useAuthInfoContext(tabKey, {
    authKey: auth?.type === "view" ? auth?.resource : auth?.authKey,
  });

  return (
    <AuthInfoContext.Provider value={value}>
      <AntTabs.TabPane {...props} tabKey={tabKey} />
    </AuthInfoContext.Provider>
  );
};

export { useTabs } from "./hooks";
