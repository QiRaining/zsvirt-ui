import { SubAppLayout } from "@zstack/zsphere-components";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import type { IMenu } from "@zstack/zsphere-types";
import { useCallback } from "react";
import { Outlet } from "react-router";

import { SuspenseWrapper } from "./suspense-wrapper";

/**
 * zmigrate 相关菜单项的 key
 * 当迁移服务未安装时，这些菜单项将被隐藏
 */
const ZMIGRATE_MENU_KEYS = [
  "virtualization.zmigrate.resource",
  "virtualization.zmigrate.task",
] as const;

type ZmigrateMenuKey = (typeof ZMIGRATE_MENU_KEYS)[number];

/**
 * 运维管理（monitoring-om）布局包装器
 *
 * 通过 getMenuList 回调动态过滤菜单。
 * 当 zmigrate 迁移服务未安装时，隐藏「迁移资源」和「迁移任务」菜单项。
 * 「迁移服务」菜单项（用于上传安装）始终显示。
 *
 * 安装状态通过 usePlatformStore 中的 currentZMigrate 判断，
 * 由 useGetZMigrate 在应用启动时通过 getZMigrateInfos GraphQL 查询设置。
 */
export default function MonitoringOmWrapper() {
  const currentZMigrate = usePlatformStore((state) => state.currentZMigrate);

  const getMenuList = useCallback(
    (menuList: IMenu[]): IMenu[] => {
      if (currentZMigrate?.installed) {
        // 迁移服务已安装，显示所有菜单
        return menuList;
      }

      // 迁移服务未安装，过滤掉 zmigrate 相关菜单项
      return menuList.map((menu) => {
        if (!menu.children) {
          return menu;
        }

        return {
          ...menu,
          children: menu.children.filter(
            (child) =>
              !ZMIGRATE_MENU_KEYS.includes(child.key as ZmigrateMenuKey),
          ),
        };
      });
    },
    [currentZMigrate?.installed],
  );

  return (
    <SuspenseWrapper>
      <SubAppLayout
        getMenuList={getMenuList}
        customParentKey="virtualization.monitoring.om"
      >
        <Outlet />
      </SubAppLayout>
    </SuspenseWrapper>
  );
}
