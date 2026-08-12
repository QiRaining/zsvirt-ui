import { getMenuTree } from "@zstack/zsphere-config";
import { find } from "lodash-es";
import qs from "qs";
import { useMemo } from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";

import type { NavigationType } from "../../constant";
import { DEFAULT_LEFT_NAV_KEY } from "../../constant";

//获取目录树的名称（leftnav）和activeMenuKey
export const useGetMenuName = () => {
  const intl = useIntl();
  const location = useLocation();

  //树的大类
  const activeMenuKey: NavigationType = useMemo(() => {
    return (
      (qs.parse(window.location.search, { ignoreQueryPrefix: true })?.[
        DEFAULT_LEFT_NAV_KEY
      ] as NavigationType) ?? ("virtualization.cluster.host" as NavigationType)
    );
  }, [location.search]);

  //TreeName
  const menuName: string = useMemo(() => {
    const virtualizationMenu = getMenuTree("root", intl);
    const vrMenu = find(virtualizationMenu, { key: "virtualization.resource" });
    const menu = find(vrMenu?.children, { key: activeMenuKey });
    return menu?.name ?? ("" as string);
  }, [activeMenuKey, intl]);

  //选中资源的名称
  const resouceType: string = useMemo(() => {
    const type = location.pathname.split("/")?.[1];
    return type as string;
  }, [location.pathname]);

  //选中资源的Uuid
  const resouceUuid: string = useMemo(() => {
    return (
      qs.parse(location.search, { ignoreQueryPrefix: true })?.uuid ??
      ("" as any)
    );
  }, [location.search]);

  // //从哪儿跳来的lastResource
  // const lastResource: string =
  //   qs.parse(window.location.search, { ignoreQueryPrefix: true })?.lastResource ?? ('' as any)

  return {
    menuName,
    activeMenuKey,
    resouceType,
    resouceUuid,
    // lastResource
  };
};
