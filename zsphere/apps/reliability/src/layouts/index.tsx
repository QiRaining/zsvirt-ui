import { SubAppLayout, usePlatformStore } from "@zstack/zsphere-components";
import type { IMenu } from "@zstack/zsphere-types";
import React from "react";

interface IProps {
  children: React.ElementType;
}

export default ({ children }: IProps) => {
  // ZSV-3787 将树菜单去掉，后续可以直接删除 directory 目录和 common.ts 文件
  const { managementNode } = usePlatformStore();

  const getMenuList = React.useCallback(
    async (menuList: IMenu[]) => {
      if (!managementNode?.isDoubleManagementNode) {
        menuList.forEach((menu, index) => {
          menuList[index].children = menu?.children?.filter(
            (action) => action.key !== "virtualization.reliability",
          );
        });
      }

      return menuList;
    },
    [managementNode],
  );

  return <SubAppLayout getMenuList={getMenuList}>{children}</SubAppLayout>;
};
