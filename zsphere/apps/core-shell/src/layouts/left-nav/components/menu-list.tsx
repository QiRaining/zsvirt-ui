import { Divider } from "@zstack/design";
import { CommandLink } from "@zstack/zsphere-components";
import type { IllustrationTypes } from "@zstack/zsphere-illustration";
import { Illustration } from "@zstack/zsphere-illustration";
import type { IMenu, NavView } from "@zstack/zsphere-types";
import { LeftNavType } from "@zstack/zsphere-types";
import React, { memo } from "react";
import { useIntl } from "react-intl";

import { usePersistTreeStatus } from "../../../hooks/use-persist-tree-state";
import { getTreeKey } from "../../../utils/tree-utils";

import style from "../nav-style.module.less";

interface IMenuDisplay extends IMenu {
  highlight: boolean;
}

interface MenuListProps {
  menus: IMenuDisplay[];
  isExpand: boolean;
}

interface MenuItemProps {
  item: IMenuDisplay;
  isExpand: boolean;
  title: string;
  firstLevelMenuTo: string;
  firstLevelMenuMicroAppName: string;
}

// 菜单项组件
const MenuItem: React.FC<MenuItemProps> = React.memo(
  ({
    item,
    isExpand,
    title,
    firstLevelMenuTo,
    firstLevelMenuMicroAppName,
  }: MenuItemProps) => {
    return (
      <CommandLink
        command={{
          id: `navigate.${item.key}`,
          tooltipProps: { title, placement: "left" },
        }}
        key={item.key}
        to={firstLevelMenuTo}
        className={item.highlight ? style.menuItemActive : style.menuItem}
        microAppName={firstLevelMenuMicroAppName}
        disableLastResource
        isRouterManaged
      >
        <Illustration type={item.iconKey as IllustrationTypes} size={20} />
        {isExpand && (
          <div className={style.menuItemText} style={{ marginLeft: 4 }}>
            {title}
          </div>
        )}
      </CommandLink>
    );
  },
);

MenuItem.displayName = "MenuItem";

const MenuList: React.FC<MenuListProps> = ({
  menus,
  isExpand,
}: MenuListProps) => {
  const { getTreeStatus } = usePersistTreeStatus();
  const intl = useIntl();

  const leftNav = (sessionStorage.getItem("resource_active_left_nav") ||
    LeftNavType.ClusterHost) as LeftNavType;

  const navView =
    sessionStorage.getItem(`${leftNav}-virRscNavView`) || "resource";

  const treeStatus = getTreeStatus({
    key: getTreeKey(leftNav, navView as NavView),
  });

  return (
    <>
      {menus?.map((itemLevel1) => {
        const firstLevelMenuMicroAppName =
          itemLevel1.path?.split("/")?.[1] || "";

        //判断跳转
        const firstLevelMenuTo =
          firstLevelMenuMicroAppName !== "virtualization-resource"
            ? itemLevel1.path?.split(firstLevelMenuMicroAppName)?.[1] || ""
            : `/${treeStatus.selectedResource}/detail?uuid=${treeStatus.selectedKey}&leftnav=${leftNav}&navView=${navView}`;

        const title = intl.formatMessage({
          id: itemLevel1?.i18nKey,
          defaultMessage: itemLevel1.name,
        });

        return (
          <React.Fragment key={itemLevel1.key}>
            {["virtualization.administration"].includes(itemLevel1.key) && (
              <Divider className={style.divider} />
            )}
            <MenuItem
              item={itemLevel1}
              isExpand={isExpand}
              title={title}
              firstLevelMenuTo={firstLevelMenuTo}
              firstLevelMenuMicroAppName={firstLevelMenuMicroAppName}
            />
          </React.Fragment>
        );
      })}
    </>
  );
};

export default memo(MenuList);
