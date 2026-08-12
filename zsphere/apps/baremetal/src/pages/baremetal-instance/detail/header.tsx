import { Action, useAuth } from "@zstack/zsphere-components";
import { DetailBreadcrumb, Header } from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import type { BaremetalInstance as IBaremetalInstance } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import type { FC } from "react";
import React, { useMemo } from "react";
import { useIntl } from "react-intl";

import useActionConfig from "../config/useActionConfig";
import useBaremetalConsole from "../hooks/BaremetalConsole";

import style from "./style.module.less";

export interface IProps {
  current: IBaremetalInstance;
  refetch: Function;
}

const DetailHeader: FC<IProps> = ({ current, refetch }) => {
  const intl = useIntl();
  const { name = "", description } = current || {};
  const { onClick, checkIfWebTerminalEnabled } = useBaremetalConsole({
    instance: current,
  });

  const { list: menuList, viewMap } = useActionConfig();
  const { hasAuth } = useAuth();

  const hasEnterWebTerminalAuth = hasAuth({
    authKey: "open.console",
    resource: "baremetal.instance",
    type: "action",
  });

  const consoleIcon = useMemo(() => {
    if (!hasEnterWebTerminalAuth) {
      return "disk-2";
    }

    return checkIfWebTerminalEnabled() ? (
      <div
        className={style["console-icon-container"]}
        onClick={() => onClick()}
      >
        <Illustration type="console.linux" size={120} />
        <div className={style["console-icon-button"]}>
          {intl.formatMessage({
            id: "open.console",
            defaultMessage: "Launch Console",
          })}
        </div>
      </div>
    ) : (
      <div className={cls(style["console-icon-container"], style.disabled)}>
        <Illustration type="console.linux" size={120} />
        <div className={style["console-icon-button"]}>
          {intl.formatMessage({
            id: "open.console",
            defaultMessage: "Launch Console",
          })}
        </div>
      </div>
    );
  }, [hasEnterWebTerminalAuth, intl]);

  const memoizedSelectedList = useMemo(() => [current], [current]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon={consoleIcon}
        title={name}
        description={description}
        actions={
          <Action
            view="main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            source={current}
            selectedList={memoizedSelectedList}
          />
        }
      />
    </>
  );
};

export default DetailHeader;
