import { cacheTree } from "@zstack/zsphere-config";
import { IMenu } from "@zstack/zsphere-types";
import { useLocalStorageState } from "ahooks";
import { useMemo, createContext, useContext, useCallback } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";

import { ConfigContext } from "../config";
import {
  useAuthMap,
  noValidResource,
  IAuthParams,
  getCurrentMenu,
  getCurrentMenuKeys,
} from "./const";
import { IProps, IRouterByAuth } from "./type";

interface IUIPrivilege {
  [key: string]: {
    actions: string[];
    view: string[];
  };
}

const getMenuKey = (): string => {
  const pathKeys: string[] = window.location.pathname.split("/");

  let menuKey = "";

  if (pathKeys.length >= 2) {
    menuKey = pathKeys.pop()!;
    if (["create", "detail"].indexOf(menuKey) >= 0) {
      menuKey = pathKeys.pop()!;
    }
  }

  menuKey = menuKey.replace(/-/g, ".");

  return menuKey;
};

export function useAuth() {
  const [currentUser] = useLocalStorageState<any>("currentUser");
  const { value } = useAuthInfoContext();
  const [{ map, noSet }] = useAuthMap();
  const [tooltip] = useLocalStorageState("debug-tooltip");
  const { auth: { disabled } = { disabled: false } } =
    useContext(ConfigContext);

  const {
    username,
    uiPrivilege,
  }: { username: string; uiPrivilege: IUIPrivilege } = currentUser || {
    username: "",
    uiPrivilege: {},
  };

  const menuKey = useMemo(() => value?.validatorKey || getMenuKey(), [value]);

  const hasAuth = useCallback(
    (params: IProps, noValid = !!tooltip): boolean => {
      const resource = params.resource || value.validatorKey;
      if (!resource || resource === noValidResource || noValid || disabled) {
        return true;
      }

      const has = ({ type, authKey, resource: rs }: IAuthParams) => {
        if (type === "view") {
          const currentMenu = getCurrentMenu(rs ?? "");
          const currentMenuKeys = getCurrentMenuKeys(currentMenu);

          return (
            currentMenuKeys.some((key) =>
              map.has(`${key}||${type}||${authKey}`),
            ) || map.has(`${rs}||${type}||${authKey}`)
          );
        }

        return map.has(`${rs}||${type}||${authKey}`);
      };

      return "authKeys" in params
        ? params.authKeys.some((authKey) =>
            has({
              authKey,
              type: params.type,
              resource,
            }),
          )
        : has({
            type: params.type,
            authKey: params.authKey!,
            resource,
          });
    },
    [disabled, map, tooltip, value.validatorKey],
  );

  return {
    username,
    uiPrivilege,
    menuKey,
    hasAuth,
    noSet,
  };
}

export const keyArrField = "_keyArr" as const;

export function useKeyArr() {
  const { state } = useLocation();

  const keyArr = useMemo(() => {
    if (state && typeof state === "object" && keyArrField in state) {
      return (state as { [keyArrField]?: Array<string> })[keyArrField];
    }

    const { [keyArrField]: _keyArr } = window.history.state ?? {};

    return _keyArr;
  }, [state]);

  return keyArr;
}

export function useRouterByAuth<
  T extends { auth?: IRouterByAuth; [props: string]: any },
>(
  list: Array<T>,
): {
  hasAuth: ReturnType<typeof useAuth>["hasAuth"];
  onChange: (tab: string) => void;
  activeKey: string;
  listComputed: Array<T>;
} {
  const navigate = useNavigate();

  const { hasAuth } = useAuth();

  const location = useLocation();

  const listComputed = useMemo(
    () => list.filter(({ auth }) => (auth ? hasAuth(auth) : true)),
    [hasAuth, list],
  );

  const {
    value: { keyArr },
  } = useAuthInfoContext();

  const _keyArr = useKeyArr();

  // 根据路由中 state 获取 list 激活项
  const activeKey = useMemo(() => {
    const defaultKey = listComputed[0]?.key ?? "";

    if (!_keyArr?.length) {
      return defaultKey;
    }

    const key = _keyArr[keyArr.length];

    // 从路由 state 中获取的当前层激活 key,如果没有出现在 list 中，则使用默认 key.
    return listComputed?.find((item) => item?.key === key)?.key || defaultKey;
  }, [listComputed, _keyArr, keyArr]);

  // 层叠上层 key 与当前 key 保存到路由 state 中
  const onChange = (tab: string) => {
    navigate(`${location.pathname}${location.search}`, {
      replace: true,
      state: {
        ...(location.state as object),
        [keyArrField]: [...(keyArr ?? []), tab],
      },
    });
  };

  return {
    hasAuth,
    onChange,
    activeKey,
    listComputed,
  };
}

export const AuthInfoContext = createContext<{
  key?: string;
  keyArr: string[];
  validatorKey?: string;
  name?: string;
  pathname?: string;
  i18nKey?: string;
}>({
  keyArr: [],
});

// 搭配 AuthInfoContext 生成层叠信息，从而达到刷新页面时，还原 Menu, Tabs，LeftNav，DetailNav 选中
export const useAuthInfoContext = (
  tabKey?: string,
  {
    authKey,
    name,
    pathname,
    i18nKey,
  }: {
    authKey?: string;
    name?: string;
    pathname?: string;
    i18nKey?: string;
  } = {},
) => {
  const {
    keyArr,
    key,
    validatorKey,
    name: upperLayerName,
    pathname: upperLayerPathname,
    i18nKey: upperLayerI18nKey,
  } = useContext(AuthInfoContext);

  const value = useMemo(
    () =>
      tabKey
        ? {
            key: tabKey,
            keyArr: [...(keyArr ?? []), ...(tabKey ? [tabKey] : [])],
            get validatorKey() {
              return authKey || tabKey || validatorKey;
            },
            name: name ?? upperLayerName,
            pathname: pathname ?? upperLayerPathname,
            i18nKey: i18nKey ?? upperLayerI18nKey,
          }
        : {
            keyArr,
            key,
            get validatorKey() {
              return authKey || tabKey || validatorKey;
            },
            name: name ?? upperLayerName,
            pathname: pathname ?? upperLayerPathname,
            i18nKey: i18nKey ?? upperLayerI18nKey,
          },
    [
      authKey,
      key,
      keyArr,
      name,
      pathname,
      upperLayerName,
      upperLayerPathname,
      tabKey,
      validatorKey,
      i18nKey,
    ],
  );

  return { value };
};

// 根据 location 获取当前 menu 激活项
export function useActiveMenu() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { keyMap, menuList } = cacheTree;

  return useMemo(() => {
    const list: IMenu[] = [];
    const filterList: IMenu[] = [];
    let current: IMenu | undefined;

    menuList.forEach((item) => {
      const { url, path } = item;
      const iframeUrl = searchParams.get("iframeUrl");
      if (iframeUrl && decodeURIComponent(iframeUrl) === url) {
        current = item;
      } else if (path && window.location.pathname.startsWith(path)) {
        filterList.push(item);
      }
    });
    if (filterList.length > 0) {
      // 优先匹配最长的path，特殊场景 /vm 和 /vm-scheduling-rule
      current = filterList.reduce(
        (prev, next) => (next.path!.length > prev.path!.length ? next : prev),
        filterList[0],
      );
    }
    while (current) {
      list.unshift(current);
      if (current.parentKey !== "") {
        current = menuList[keyMap[current.parentKey!]];
      } else {
        current = undefined;
      }
    }
    return {
      activeKeys: list.map((item) => item.key),
      activeItems: list,
    };
  }, [location, searchParams, keyMap, menuList]);
}
