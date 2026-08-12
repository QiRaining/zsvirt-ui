import React from "react";
import { LinkProps } from "react-router";

import { IRouterByAuth } from "../a-cloud-old-components/auth/type";

export type ILinkProps = (
  | LinkProps
  | {
      innerRef?: React.Ref<HTMLAnchorElement>;
      leftNav?: string;
      navView?: string;
      to: LinkProps["to"];
      microAppName: string;
      children?: React.ReactNode;
      zoneUuid?: string;
      from?: string;
      className?: string;
      onClick?: (evt: React.MouseEvent) => void;
    }
) & {
  disableLastResource?: boolean;
  auth?: IRouterByAuth;
  // 是否跨应用，如果Link出现在主应用的话走UmiLink会丢失子应用前缀
  isRouterManaged?: boolean;
  // 是否保留 state，用于页面切换时保持当前 tab
  keepState?: boolean;
};
