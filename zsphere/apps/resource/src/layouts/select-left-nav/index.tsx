import { Tooltip } from "@zstack/design";
import { Icon, type IconTypes } from "@zstack/icon";
import { useCommandInfo } from "@zstack/zsphere-components";
import type { IMenu, NavView, LeftNavType } from "@zstack/zsphere-types";
import { Menu } from "antd";
import type { MenuProps } from "antd";
import cls from "classnames";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { useNavigate } from "react-router";

import { usePersistTreeStatus } from "../hooks/use-persist-tree-state";
import { getTreeKey } from "../utils";
import { useFilteredMenu } from "./hook";

import style from "./style.module.less";

const MENU_ITEM_STYLE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
};
const MENU_ICON_STYLE: React.CSSProperties = {
  marginRight: "4px",
  flexShrink: 0,
  width: "16px",
  height: "16px",
};

interface IProps {
  activeKey: LeftNavType;
  parentResizing: boolean;
}

const SelectView: React.FC<IProps> = ({ parentResizing, activeKey }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const menu: IMenu[] = useFilteredMenu(intl);

  const { getTreeStatus } = usePersistTreeStatus();
  //这里读缓存，根据不同的leftNav，判断treeView

  const onChangeView: MenuProps["onClick"] = (e) => {
    const leftNav = e.key as LeftNavType;
    const navView = (sessionStorage.getItem(`${leftNav}-virRscNavView`) ||
      "resource") as NavView;
    const treeKey = getTreeKey(leftNav, navView);
    const treeStatus = getTreeStatus({ key: treeKey });

    sessionStorage.setItem(`${leftNav}-virRscNavView`, navView);
    sessionStorage.setItem("resource_active_left_nav", leftNav);

    // URL 驱动：统一使用 React Router 的 navigate，确保 Outlet 能正确更新
    if (treeStatus.selectedResource) {
      navigate({
        pathname: `/virtualization-resource/${treeStatus.selectedResource}/detail`,
        search: `?uuid=${treeStatus.selectedKey}&leftnav=${leftNav}&navView=${navView}`,
      });
    } else {
      navigate({
        pathname: "/virtualization-resource/root-node/detail",
        search: `?uuid=-1&leftnav=${leftNav}&navView=${navView}`,
      });
    }
  };

  const commandInfo = useCommandInfo(
    "navigate.virtualization.resource.submenu",
  );

  const menuItems: MenuProps["items"] = useMemo(() => {
    return menu?.map((group) => {
      return {
        key: group.key,
        label: group.name,
        type: "group" as const,
        children: group?.children?.map((item) => {
          const title = intl.formatMessage({
            id: item.i18nKey,
            defaultMessage: item.name,
          });
          const keyLabel = commandInfo?.keyLabelMap.get(item.key);
          return {
            key: item.key,
            label: (
              <Tooltip
                placement="right"
                title={title + (keyLabel ? ` (${keyLabel})` : "")}
              >
                <div style={MENU_ITEM_STYLE}>
                  <Icon
                    type={item.iconKey as IconTypes}
                    style={MENU_ICON_STYLE}
                  />
                  {title}
                </div>
              </Tooltip>
            ),
          };
        }),
      };
    });
  }, [menu, intl, commandInfo]);

  return (
    <div
      className={cls(style["view-select-container"], {
        [style["view-select-container-resizing-active"]]: parentResizing,
      })}
    >
      <Menu
        selectedKeys={[activeKey]}
        items={menuItems}
        onClick={onChangeView}
      />
    </div>
  );
};

export default React.memo(SelectView);
