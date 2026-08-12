import { Link as DesignLink } from "@zstack/design";
import qs from "qs";
import React, { FC } from "react";
import { useNavigate, useLocation } from "react-router";

import Text from "../a-cloud-old-components/text";
import { useTableSelect } from "../modal-select/context";
import {
  useLinkAuth,
  parse,
  findAuthByPath,
  getCurrentMicroAppName,
} from "./hooks";
import { ILinkProps } from "./type";

import "./style.less";

export type { ILinkProps } from "./type";

interface ILink extends FC<ILinkProps> {
  Detail: typeof Detail;
  Owner: typeof Owner;
  useLinkAuth: typeof useLinkAuth;
  parse: typeof parse;
  findAuthByPath: typeof findAuthByPath;
}

const Link: ILink = ({
  isRouterManaged,
  keepState = true,
  disableLastResource,
  ...props
}) => {
  const { linkJump } = useTableSelect();
  const { hasAuth } = useLinkAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentMicroAppName = getCurrentMicroAppName();

  try {
    // 当处于 table-select 中时，link 不支持跳转
    if (!linkJump || !hasAuth(props) || !window) {
      return (
        <span className={props.className}>
          {props.children as React.ReactNode}
        </span>
      );
    }

    const { to: targetTo } = props;
    const toIsString = typeof targetTo === "string";

    const targetUrl = toIsString ? targetTo : (targetTo as any).pathname;

    const [targetPathname = "", targetSearch = ""] = targetUrl.split("?") || [];
    const targetSearchObj = qs.parse(targetSearch, { ignoreQueryPrefix: true });

    const {
      pathname: curPathname = "",
      search: curSearch = "",
      state: curState = {},
    } = location;
    const lastResourceObj = disableLastResource
      ? {}
      : { lastResource: curPathname };
    if (
      "microAppName" in props &&
      (currentMicroAppName !== props.microAppName || isRouterManaged)
    ) {
      const { microAppName, className, children } = props;

      if (!microAppName) {
        return null;
      }
      // 如果不是同一子应用，忽略 search
      const newAppSearchStr = qs.stringify(
        {
          ...targetSearchObj,
          ...lastResourceObj,
        },
        { addQueryPrefix: true },
      );

      const newAppUrl = `/${microAppName}${targetPathname}${newAppSearchStr}`;
      const newAppPathname = `/${microAppName}${targetPathname}`;

      return (
        <a
          ref={props.innerRef}
          href={newAppUrl}
          className={className}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            window.needClearTab = true;

            // 如果 isRouterManaged 为 true，使用 React Router 的 navigate 方法来触发路由更新
            // 使用对象格式传入 pathname 和 search，这样可以确保 React Router 正确处理路由更新
            // 这样可以确保 React Router 的 location 正确更新，菜单高亮状态也会正确更新
            if (isRouterManaged) {
              // 调用自定义 onClick（如果有），但不阻止导航
              props.onClick?.(e);
              // 使用 React Router 的 navigate 方法，传入对象格式（pathname + search）
              // 这样可以确保 React Router 正确处理路由更新，包括跨微应用的路由跳转
              navigate({
                pathname: newAppPathname,
                search: newAppSearchStr,
              });
              return;
            }

            // 对于非 isRouterManaged 的情况，使用 pushState（保持原有逻辑以支持 state 传递）
            // 此处需要对 state 进行降级处理，但是要注意我们传递的 state 内容可能会被 history 库覆盖。
            // 会不会覆盖 history 库的具体实现有关。 history 5 在某种情况下中会多出来 idx,usr,key 三个字段。
            // 此处不使用 react-router 的 history.push 的原因是因为 history 设置了 basename 属性，造成传递的 pathname 自动附加 basename
            // 此处不使用 navigatorToUrl 的原因是他内部调用的 window.history.pushState 不传递 state.
            // 另一种解决方式可以通过 window 获取到主应用的 history，进行跳转
            try {
              const newState = toIsString ? {} : curState;
              window.history.pushState(newState, "", newAppUrl);
              // pushState 不会自动触发 popstate 事件，需要手动派发
              // 微前端框架（如 qiankun/single-spa）通过监听 popstate 来感知路由变化并挂载对应子应用
              window.dispatchEvent(
                new PopStateEvent("popstate", { state: newState }),
              );
            } catch (error) {
              console.error(
                "Business Link component Error pushing state:",
                error,
              );
            }
            // 调用自定义 onClick（如果有）
            props.onClick?.(e);
          }}
        >
          {children}
        </a>
      );
    }

    // 处理 location 的 search 部分，已有的累加到 to 中
    // 对于子应用相同的时候，search 保留，切换子应用的时候，search 替换
    const curSearchObj = qs.parse(curSearch, { ignoreQueryPrefix: true });
    const newSearchStr = qs.stringify(
      {
        ...curSearchObj,
        ...targetSearchObj,
        ...lastResourceObj,
      },
      { addQueryPrefix: true },
    );

    // 提取 state（如果有）
    const targetState = toIsString
      ? keepState
        ? curState
        : {}
      : (targetTo as any).state || (keepState ? curState : {});
    const hasState = targetState && Object.keys(targetState).length > 0;

    const basePath = currentMicroAppName ? `/${currentMicroAppName}` : "";
    const ensureBasePath = (path: string) => {
      if (!basePath) return path;
      if (path.startsWith(basePath)) return path;
      return `${basePath}${path.startsWith("/") ? path : `/${path}`}`;
    };

    const pathnameWithBase = ensureBasePath(targetPathname);

    let newTo: any;

    if (toIsString) {
      newTo = {
        pathname: pathnameWithBase,
        search: newSearchStr,
      };
    } else {
      newTo = {
        ...(targetTo as any),
        pathname: pathnameWithBase,
        search: newSearchStr,
      };
      // 移除 state，因为 React Router 7 的 Link 不支持 state
      delete newTo.state;
    }

    const mergedClassName = props.className
      ? `zstack-biz-link ${props.className}`
      : "zstack-biz-link";

    return (
      <DesignLink
        {...(props as any)}
        className={mergedClassName}
        to={newTo}
        onClick={(e: any) => {
          window.needClearTab = true;
          const navigationTarget = {
            pathname: pathnameWithBase,
            search: newSearchStr,
          };

          if (hasState) {
            e.preventDefault();
            navigate(navigationTarget, { state: targetState });
          } else {
            e.preventDefault();
            navigate(navigationTarget);
          }
          props.onClick?.(e);
        }}
      >
        {props.children as React.ReactNode}
      </DesignLink>
    );
  } catch (e) {
    console.error("Business Link component encountered an error:", e);
    return <span>{props.children as React.ReactNode}</span>;
  }
};

const Detail: React.FC<
  ILinkProps & {
    to: string;
    uuid?: string;
    isRouterManaged?: boolean;
    leftnav?: string;
    navView?: string;
    zoneUuid?: string;
    from?: string;
  }
> = ({ uuid, to, leftnav, navView = "notGroup", zoneUuid, from, ...props }) => {
  if (!uuid) return null;
  const buildUrl = (base: string, params: Record<string, string>) => {
    const queryString = qs.stringify(params, { addQueryPrefix: true });
    return `${base}${queryString}`;
  };

  const formatTo = buildUrl(`${to}/detail`, {
    uuid,
    ...(leftnav ? { leftnav } : {}),
    ...(navView ? { navView } : {}),
    ...(zoneUuid ? { zoneUuid } : {}),
    ...(from ? { from } : {}),
  });

  return <Link {...props} to={formatTo} />;
};

const Owner: React.FC<{
  uuid: string;
  type?: string;
  tooltip?: boolean;
  children?: React.ReactNode;
}> = ({ uuid, type, tooltip = true, ...props }) => {
  const tooltipWrapper = (
    children: React.ReactElement,
    value: React.ReactNode,
  ): React.ReactElement =>
    tooltip ? (
      <Text value={value as string | number | null | undefined}>
        <>{children}</>
      </Text>
    ) : (
      (children ?? null)
    );

  if (uuid === "36c27e8ff05c4780bf6d2fa65700f22e") {
    return <span>{props?.children as any}</span>;
  }

  // need to do in zsv
  return tooltipWrapper(
    <Link
      {...props}
      to={`/account-information/user/detail?uuid=${uuid}`}
      microAppName="virtualization-administration"
    />,
    props?.children as any,
  );
};

Link.Detail = Detail;
Link.Owner = Owner;
Link.useLinkAuth = useLinkAuth;
Link.parse = parse;
Link.findAuthByPath = findAuthByPath;

export { useLinkAuth } from "./hooks";
export default Link;
