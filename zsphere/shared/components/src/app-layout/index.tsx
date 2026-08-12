import { ApolloProvider } from "@apollo/client";
import { Icon } from "@zstack/icon";
import { getMenuTree, getSubMenu } from "@zstack/zsphere-config";
import { useConstantMap } from "@zstack/zsphere-constant";
import type { IMenu } from "@zstack/zsphere-types";
import { genUuid } from "@zstack/zsphere-utils";
import { Menu } from "antd";
import type { MenuItemType } from "antd/es/menu/hooks/useItems";
import qs from "qs";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { useNavigate, useLocation } from "react-router";

import { getBaseCls } from "../_utils/common";
import {
  AuthInfoContext,
  useAuthInfoContext,
} from "../a-cloud-old-components/auth";
import ConfigProvider from "../a-cloud-old-components/config";
import { ConfigEmptyProvider } from "../empty";
import { SubAppLayoutErrorBoundary } from "./error-boundary";

import "./style.less";
import { LeftNavResizable } from "./left-nav-resize";
import { useGetActiveMenuItem } from "./use-get-active-menu";
import { useJudgeMenuAuth } from "./use-judge-auth";

// 扩展 MenuItemType 以支持 group 类型
type ExtendedMenuItemType = MenuItemType & {
  type?: "group";
  children?: ExtendedMenuItemType[];
  key?: string;
  label?: React.ReactNode;
  icon?: React.ReactNode;
};

export const MenuListAuth: React.FC<{
  menuList: Array<IMenu>;
  children?: React.ReactNode;
}> = ({ children }) => {
  const { activeItems } = useGetActiveMenuItem();
  const activeItem =
    activeItems.length > 0
      ? activeItems.slice(-1)[0]
      : { key: "", name: "", path: "", i18nKey: "" };
  const { key, name, path, i18nKey } = activeItem;
  const { value } = useAuthInfoContext(key, { name, pathname: path, i18nKey });
  return (
    <AuthInfoContext.Provider value={value}>
      {children}
    </AuthInfoContext.Provider>
  );
};

const baseCls = getBaseCls("app-layout");

interface IProps {
  children?: React.ReactNode;
  getMenuList?: (menuList: IMenu[]) => IMenu[] | Promise<IMenu[]>;
  apolloClient?: any;
  customParentKey?: string;
}

const SubAppLayout: React.FC<IProps> = ({
  children,
  getMenuList,
  apolloClient,
  customParentKey,
}) => {
  const intl = useIntl() as any;
  const { hasAuth } = useJudgeMenuAuth();
  const { activeKeys } = useGetActiveMenuItem();
  const menuTree = useMemo(() => getMenuTree("root", intl), [intl]);
  const constant = useConstantMap(intl);
  const navigate = useNavigate();
  const location = useLocation();

  const [subMenu, setSubMenu] = useState<IMenu | undefined>();
  const [menuList, setMenuList] = useState<IMenu[]>([]);

  // 优化：使用 useMemo 缓存计算结果，减少不必要的计算
  const menuData = useMemo(() => {
    const search = qs.parse(location.search, {
      ignoreQueryPrefix: true,
    });

    const baseName = `/${location.pathname.split("/")[1]}`;

    let parentKey: string | undefined;
    if (customParentKey) {
      parentKey = customParentKey;
    } else if (search.parentKey) {
      parentKey = search.parentKey as string;
    } else {
      parentKey = baseName.slice(1).replace(/-/g, ".");
      // 一级自定义菜单带 url
      parentKey = parentKey === "plugin" ? undefined : parentKey;
    }

    return { parentKey, search, baseName };
  }, [customParentKey, location]);

  // 优化：分离异步逻辑，避免在 useEffect 中直接调用异步函数
  useEffect(() => {
    let isMounted = true; // 添加组件挂载状态标记

    if (!menuData.parentKey || !menuTree) {
      if (isMounted) {
        setMenuList([]);
        setSubMenu(undefined);
      }
      return;
    }

    const target = getSubMenu(menuTree, menuData.parentKey);
    if (!target) {
      if (isMounted) {
        setMenuList([]);
        setSubMenu(undefined);
      }
      return;
    }

    const subMenuList = target.children || [];

    if (getMenuList) {
      // 异步处理菜单列表
      Promise.resolve()
        .then(() => getMenuList(subMenuList))
        .then((filterList) => {
          // 只有在组件仍然挂载时才更新状态
          if (isMounted) {
            setMenuList(filterList);
            setSubMenu(target);
          }
        })
        .catch((err) => {
          console.error("Failed to get menu list:", err);
          if (isMounted) {
            setMenuList([]);
            setSubMenu(undefined);
          }
        });
    } else {
      if (isMounted) {
        setMenuList(subMenuList);
        setSubMenu(target);
      }
    }

    // 清理函数：组件卸载时设置标记
    return () => {
      isMounted = false;
    };
  }, [menuData.parentKey, menuTree, getMenuList]);

  // 优化：将权限检查逻辑提取为 useCallback，避免重复创建函数
  // 实现"叶子有权限其父级就有权限"的逻辑
  // 父级菜单不考虑自己的权限，只根据子菜单权限决定是否显示
  const isShow = useCallback(
    (item: IMenu, visited = new Set<string>()): boolean => {
      // 防止循环引用导致的无限递归
      if (visited.has(item.key)) {
        return false;
      }
      visited.add(item.key);

      try {
        // 如果有子菜单，递归检查子菜单权限
        if (item.children && item.children.length > 0) {
          const hasChildAuth = item.children.some((child) =>
            isShow(child, visited),
          );
          // 父级菜单：只根据子菜单权限决定是否显示
          return hasChildAuth;
        }

        // 叶子节点，才检查自己的权限
        const hasCurrentAuth = hasAuth({
          resource: item.key,
          authKey: "list",
          type: "view",
        });

        return hasCurrentAuth;
      } finally {
        // 清理访问记录，允许其他路径访问
        visited.delete(item.key);
      }
    },
    [hasAuth],
  );

  const isParentShow = useCallback(
    (subChildren: IMenu[]) => {
      return subChildren.reduce(
        (prev, current) => prev || isShow(current),
        false,
      );
    },
    [isShow],
  );

  const menuItems = useMemo(() => {
    const result: ExtendedMenuItemType[] = [];
    const availablePaths: string[] = []; // 收集所有有权限的路径

    menuList.forEach((item) => {
      if (!isShow(item)) return;

      const label = item?.i18nKey
        ? intl.formatMessage({
            id: item.i18nKey,
            defaultMessage: item.name,
          })
        : item.name;

      const icon = item.iconKey ? (
        <Icon
          type={item.iconKey as any}
          style={{ marginRight: 4, top: 1, width: 16, height: 16 }}
        />
      ) : undefined;

      // 如果是 isTab 菜单项，直接渲染为单个菜单项
      if (item.isTab) {
        if (item.path) {
          availablePaths.push(item.path);
        }
        result.push({
          key: item.key,
          label: (
            <a
              href={item.path}
              onClick={(e) => {
                e.preventDefault();
                if (item.path) {
                  navigate(item.path);
                }
              }}
            >
              {label}
            </a>
          ),
          icon,
        });
        return;
      }

      // 如果有子菜单且子菜单有权限显示，使用 Menu.ItemGroup 分组
      if (
        item.children &&
        item.children.length > 0 &&
        isParentShow(item.children)
      ) {
        const groupItems = item.children
          .filter((child) => isShow(child))
          .map((child) => {
            if (child.path) {
              availablePaths.push(child.path);
            }

            const childLabel = child?.i18nKey
              ? intl.formatMessage({
                  id: child.i18nKey,
                  defaultMessage: child.name,
                })
              : child.name;

            const childIcon = child.iconKey ? (
              <Icon
                type={child.iconKey as any}
                style={{ marginRight: 4, top: 1, width: 16, height: 16 }}
              />
            ) : undefined;

            return {
              key: child.key,
              label: (
                <a
                  href={child.path}
                  onClick={(e) => {
                    e.preventDefault();
                    if (child.path) {
                      navigate(child.path);
                    }
                  }}
                >
                  {childLabel}
                </a>
              ),
              icon: childIcon,
            };
          });

        result.push({
          key: item.key,
          label,
          icon,
          type: "group",
          children: groupItems,
        });
        return;
      }

      // 普通菜单项
      if (item.path) {
        availablePaths.push(item.path);
      }
      result.push({
        key: item.key,
        label: (
          <a
            href={item.path}
            onClick={(e) => {
              e.preventDefault();
              if (item.path) {
                navigate(item.path);
              }
            }}
          >
            {label}
          </a>
        ),
        icon,
      });
    });

    return { items: result, availablePaths };
  }, [menuList, isShow, isParentShow, intl]);

  // 自动重定向到第一个有权限的菜单项（仅在当前子应用范围内）
  useEffect(() => {
    const { availablePaths } = menuItems;
    const currentPath = location.pathname;
    const appBase = menuData.baseName; // 固定使用当前子应用的 base

    // 仅当：
    // 1) 存在子应用 base；
    // 2) 当前路径处于该子应用的 base 下；
    // 3) 存在可用菜单路径；
    // 4) subMenu 已经正确加载（确保 menuList 已更新完成）；
    // 才进行跳转判断，避免跨应用来回跳或在菜单数据未加载完成时错误跳转
    if (
      !appBase ||
      !currentPath.startsWith(appBase) ||
      availablePaths.length === 0 ||
      !subMenu
    ) {
      return;
    }

    // 额外检查：确保 availablePaths 中的路径都属于当前子应用
    // 这可以避免在切换子应用时，使用旧的 availablePaths 进行错误跳转
    const validPathsForCurrentApp = availablePaths.filter((path) =>
      path.startsWith(appBase),
    );
    if (validPathsForCurrentApp.length === 0) {
      return;
    }

    const isAtAppRoot =
      currentPath === appBase || currentPath === `${appBase}/`;

    // 当前路径是否匹配本子应用内任一有效菜单路径
    const hasValidPath = validPathsForCurrentApp.some(
      (path) => currentPath === path || currentPath.startsWith(`${path}/`),
    );

    // 当进入子应用根路径，或处于子应用下但不在有效路径时，跳转到第一个有效路径
    if ((isAtAppRoot || !hasValidPath) && validPathsForCurrentApp[0]) {
      navigate(validPathsForCurrentApp[0]);
    }
  }, [menuItems, menuData.baseName, location.pathname, subMenu]);

  // 优化：提取左侧导航标题渲染逻辑
  const renderLeftNavTitle = useCallback(() => {
    if (!subMenu) return null;

    return (
      <div className={`${baseCls}-left-nav-title`}>
        <div className={`${baseCls}-left-nav-title-text`}>
          {subMenu.i18nKey
            ? intl.formatMessage({
                id: subMenu.i18nKey,
                defaultMessage: subMenu.name,
              })
            : subMenu.name}
        </div>
      </div>
    );
  }, [subMenu, intl]);

  const renderLayout = useMemo(() => {
    let layoutEle: React.ReactNode;

    // 渲染左侧导航
    if (subMenu && menuList.length > 0) {
      layoutEle = (
        <>
          <LeftNavResizable>
            {renderLeftNavTitle()}
            <Menu
              className={`${baseCls}-menu`}
              items={menuItems.items}
              inlineIndent={8}
              mode="inline"
              style={{
                width: "100%",
                overflowX: "hidden",
                overflowY: "auto",
                maxHeight: "calc(100% - 32px)",
              }}
              selectedKeys={activeKeys}
            />
          </LeftNavResizable>
          <div className={`${baseCls}-content`} id={genUuid()}>
            <MenuListAuth menuList={menuList}>{children}</MenuListAuth>
          </div>
        </>
      );
    } else {
      layoutEle = (
        <div className={`${baseCls}-content`} id={genUuid()}>
          {children}
        </div>
      );
    }

    return (
      <div className={`${baseCls}`} id={genUuid()}>
        <ConfigProvider constant={constant}>{layoutEle}</ConfigProvider>
      </div>
    );
  }, [
    subMenu,
    menuList,
    children,
    menuItems,
    renderLeftNavTitle,
    constant,
    activeKeys,
  ]);

  return (
    <SubAppLayoutErrorBoundary>
      <ConfigEmptyProvider>
        {window.g_main.apolloClient || apolloClient ? (
          <ApolloProvider client={window.g_main.apolloClient || apolloClient}>
            {renderLayout}
          </ApolloProvider>
        ) : (
          renderLayout
        )}
      </ConfigEmptyProvider>
    </SubAppLayoutErrorBoundary>
  );
};

export default SubAppLayout;
