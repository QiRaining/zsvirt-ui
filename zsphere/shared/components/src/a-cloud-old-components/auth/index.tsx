import { Icon } from "@zstack/icon";
import { IMenu } from "@zstack/zsphere-types";
import { useLocalStorageState } from "ahooks";
import { Tooltip } from "antd";
import React, { useMemo, useCallback } from "react";

import { ConfigContext } from "../config";
import { noValidResource, getMenuByKeys } from "./const";
import {
  useAuth,
  AuthInfoContext,
  useAuthInfoContext,
  useActiveMenu,
} from "./context";
import { IProps } from "./type";

const renderChildren = (children: React.ReactNode, otherProps: any) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...otherProps,
      ...children.props,
      onClick(e: any) {
        children?.props?.onClick?.(e);

        otherProps?.onClick?.(e);
      },
    });
  }

  return children;
};

const Auth: React.FC<
  IProps & {
    hideTooltip?: boolean;
    addStyleType?: "element" | "inline";
  }
> = ({ hideTooltip, addStyleType = "element", ...props }) => {
  const { auth: { disabled } = { disabled: false } } =
    React.useContext(ConfigContext);
  const { hasAuth } = useAuth();

  if ("authKeys" in props && props.type === "action") {
    const { type, authKeys, children, ...otherProps } = props;

    return hasAuth({ type, authKeys }) ? (
      <>{renderChildren(children, otherProps)}</>
    ) : null;
  }

  const { type, authKey, children, resource, ...otherProps } = props;

  if (disabled) {
    return <>{renderChildren(children, otherProps)}</>;
  }

  return hasAuth({ type, authKey, resource } as IProps) ? (
    <AuthHander
      authKey={authKey}
      type={type}
      resource={resource}
      addStyleType={addStyleType}
      hideTooltip={hideTooltip}
    >
      {renderChildren(children, otherProps)}
    </AuthHander>
  ) : null;
};

const addStyleChildren = ({
  children,
  style,
  addStyleType = "element",
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  addStyleType?: "element" | "inline";
}) => {
  if (React.isValidElement(children) && addStyleType === "inline") {
    const styleMemo = { ...children?.props?.style, ...style };

    return React.cloneElement(children, {
      ...(Object.keys(styleMemo ?? {}).length ? { style: styleMemo } : {}),
    } as any);
  }

  return <div style={style}>{children}</div>;
};

export const AuthHander: React.FC<{
  authKey: string;
  type: string;
  resource?: string;
  hideTooltip?: boolean;
  addStyleType?: "element" | "inline";
  children?: React.ReactNode;
}> = ({
  children,
  authKey,
  type,
  resource,
  hideTooltip = false,
  addStyleType = "element",
}) => {
  const [debugAuth] = useLocalStorageState("debug-auth");
  const [tooltip] = useLocalStorageState("debug-tooltip");
  const [configType] = useLocalStorageState<{
    license?: string;
    iam1?: string;
    iam2?: string[];
  }>("debug-config-type");

  const { hasAuth } = useAuth();

  const {
    value: { validatorKey },
  } = useAuthInfoContext();

  const newResource = resource || validatorKey;

  const getLink = useCallback(
    (params: { authKey: string; type: string; resource?: string }) => {
      const paramsStr = Object.entries(params)
        .reduce<string[]>((prev, [key, value]) => {
          if (!value) {
            return prev;
          }

          return [...prev, `${key}=${value}`];
        }, [])
        .join("&");

      return (
        <a
          style={{ color: "#FAFAFA" }}
          target="_blank"
          rel="noreferrer"
          href={`${debugAuth || tooltip}/auth/config?${paramsStr}`}
        >
          <div>
            <Icon style={{ marginRight: "10px" }} type="flag-fill" />
            <br />
            {`resource: ${params.resource}`}
            <br />
            {`type: ${params.type}`}
            <br />
            {`authKey: ${params.authKey}`}
            <br />
          </div>
        </a>
      );
    },
    [debugAuth, tooltip],
  );

  const tooltipTitle = useMemo(() => {
    if (!newResource || newResource === noValidResource) {
      return null;
    }

    if (type !== "view" || authKey !== "list") {
      return getLink({ resource: newResource, type, authKey });
    }

    const item = getMenuByKeys(newResource);

    if (!item?.tabs?.length) {
      return getLink({ resource: newResource, type, authKey });
    }

    return item?.tabs.map(({ key }) => (
      <span key={key}>{getLink({ resource: key, type, authKey })}</span>
    ));
  }, [authKey, getLink, newResource, type]);

  if (
    (!tooltip && !debugAuth) ||
    newResource === noValidResource ||
    hideTooltip ||
    !children
  ) {
    return (children as any) || null;
  }

  let style: any = {
    boxSizing: "border-box",
    border: "1px dotted #FF3F46",
    marginBottom: 2,
  };

  if (debugAuth) {
    style = null;
  } else if (
    (configType?.license || configType?.iam1 || configType?.iam2?.length) &&
    hasAuth({ resource: newResource, type: type as any, authKey }, false)
  ) {
    style = null;
  }

  return (
    <Tooltip title={tooltipTitle}>
      {addStyleChildren({ children, style, addStyleType })}
    </Tooltip>
  );
};

export {
  useAuth,
  useAuthInfoContext,
  useRouterByAuth,
  AuthInfoContext,
  useActiveMenu,
  useKeyArr,
  keyArrField,
} from "./context";

export { noValidResource, useAuthMap } from "./const";

export default Auth;
