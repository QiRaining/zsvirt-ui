import { getMenuTree } from "@zstack/zsphere-config";
import type { IMenu, IMenuTab } from "@zstack/zsphere-types";
import { useCallback } from "react";

import type { IProps } from "../a-cloud-old-components/auth/type";
import { useJudgeMenuAuth } from "../app-layout/use-judge-auth";
import type { ILinkProps } from "./type";

export function findResource(
  pathname: string,
  menuList: Array<IMenu | IMenuTab> = getMenuTree(),
): string | undefined {
  for (const item of menuList) {
    if ("path" in item && pathname === item.path) {
      return item.key;
    }

    if ((item as IMenu).children?.length) {
      const keyFromChildren = findResource(pathname, (item as IMenu).children);
      if (keyFromChildren) {
        return keyFromChildren;
      }
    }

    if ((item as IMenu).tabs?.length) {
      const keyFromTabs = findResource(pathname, (item as IMenu).tabs);
      if (keyFromTabs) {
        return keyFromTabs;
      }
    }
  }
}

const pathToAuthMap = new Map<RegExp | string, IProps>([
  [
    /^\/monitor$/,
    {
      type: "block",
      resource: "common",
      authKey: "monitor.screen",
    },
  ],
]);

export function findAuthByPath(path: string): IProps | undefined {
  return Array.from(pathToAuthMap.entries()).find(([match]: [any, IProps]) => {
    if (typeof match === "string") {
      return match === path;
    }

    return match.test(path);
  })?.[1];
}

export function parse(pathname: string): IProps | undefined {
  const newPathname = pathname.split("?")[0];

  const auth = findAuthByPath(pathname);

  if (auth) {
    return auth;
  }

  const segments = newPathname.split("/");
  const isDetail = segments[segments.length - 1] === "detail";

  const resource = findResource(
    isDetail ? segments.slice(0, -1).join("/") : newPathname,
  );

  if (!resource) {
    return;
  }

  return {
    resource,
    type: "view",
    authKey: isDetail ? "detail" : "list",
  };
}

export function useLinkAuth() {
  const { hasAuth: has } = useJudgeMenuAuth();

  const hasAuth = useCallback(
    (props: ILinkProps): boolean => {
      if (props.auth) {
        return has(props.auth);
      }

      const authWrapper = ({
        pathname,
        microAppName,
      }: {
        pathname?: string;
        microAppName?: string;
      }) => {
        if (!microAppName || !pathname) {
          return true;
        }

        const auth = parse(`/${microAppName}${pathname}`);

        if (auth) {
          return has(auth as any);
        }

        return true;
      };

      if ("microAppName" in props) {
        const pathname =
          typeof props.to === "string"
            ? props.to
            : typeof props.to === "object" &&
                props.to !== null &&
                "pathname" in props.to
              ? (props.to as any).pathname
              : "";
        return authWrapper({
          microAppName: props.microAppName,
          pathname,
        });
      }

      const microAppName = getCurrentMicroAppName();

      if (typeof props.to === "string") {
        return authWrapper({
          microAppName,
          pathname: props.to,
        });
      }

      if (typeof props.to === "object") {
        return authWrapper({
          microAppName,
          pathname: props.to.pathname,
        });
      }

      return true;
    },
    [has],
  );

  return {
    hasAuth,
  };
}

interface IApp {
  name: string;
  base: string;
}

export function getCurrentMicroAppName() {
  try {
    const appList = JSON.parse(localStorage.getItem("appList") ?? "[]");
    if (!appList.length) return window.location.pathname.split("/")?.[1];
    return appList.find((app: IApp) =>
      window.location.pathname.startsWith(app.base),
    )?.name;
  } catch {
    console.error("JSON parse app list error");
    return window.location.pathname.split("/")?.[1];
  }
}
