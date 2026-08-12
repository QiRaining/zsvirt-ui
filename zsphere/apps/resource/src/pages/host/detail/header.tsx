import { Tooltip } from "@zstack/design";
import { Action, useAuth } from "@zstack/zsphere-components";
import {
  DetailBreadcrumb,
  Header,
  WebTerminalConfirmModal,
} from "@zstack/zsphere-components";
import { Illustration } from "@zstack/zsphere-illustration";
import { usePlatformStore } from "@zstack/zsphere-platform-store";
import { HostStatus } from "@zstack/zsphere-types";
import type { HostVO } from "@zstack/zsphere-types/graphql";
import cls from "classnames";
import type { FC } from "react";
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";

import { renderHostNameWithBadge } from "../components/HostNameWithBadge";
import { useActionConfig } from "../config";

import style from "./style.module.less";

export interface IProps {
  current: HostVO;
  refetch: Function;
}

const DetailHeader: FC<IProps> = ({ current, refetch }) => {
  const { name = "", description, architecture, status } = current;
  const { list: menuList, viewMap } = useActionConfig();
  const { hasAuth } = useAuth();
  const [webTerminalConfirmModalVisible, setWebTerminalConfirmModalVisible] =
    useState<boolean>(false);

  const hasEnterWebTerminalAuth = hasAuth({
    type: "action",
    authKey: "enter.web.terminal",
    resource: "host",
  });

  const intl = useIntl();
  const { zopsSupportable } = usePlatformStore();

  const selectedList = useMemo(() => [current], [current]);

  const consoleIcon = useMemo(() => {
    if (!hasEnterWebTerminalAuth) {
      return "disk-2";
    }
    const isConnected = status === HostStatus.Connected;
    return zopsSupportable && isConnected ? (
      <div
        className={style["console-icon-container"]}
        onClick={() => setWebTerminalConfirmModalVisible(true)}
      >
        <Illustration type="console.linux" />
        <div className={style["console-icon-button"]}>
          {intl.formatMessage({
            id: "host.modal.open.webshell",
            defaultMessage: "Enter Web Terminal",
          })}
        </div>
      </div>
    ) : (
      <Tooltip
        title={intl.formatMessage({
          id: "host.open.console.disabled.tooltip",
          defaultMessage:
            "The host is not connected or system service is abnormal, unable to enter Web terminal.",
        })}
      >
        <div className={cls(style["console-icon-container"], style.disabled)}>
          <Illustration type="console.linux" />
          <div className={style["console-icon-button"]}>
            {intl.formatMessage({
              id: "host.modal.open.webshell",
              defaultMessage: "Enter Web Terminal",
            })}
          </div>
        </div>
      </Tooltip>
    );
  }, [hasEnterWebTerminalAuth, architecture, status, zopsSupportable, intl]);

  return (
    <>
      <DetailBreadcrumb breadcrumbItems={[{ name }]} />
      <Header.Detail
        icon={consoleIcon}
        title={renderHostNameWithBadge({
          intl,
          current,
        })}
        description={description}
        actions={
          <Action
            view="virtualization.main"
            viewMap={viewMap}
            menuList={menuList}
            position="header"
            refetch={refetch}
            source={current}
            selectedList={selectedList}
          />
        }
      />
      <WebTerminalConfirmModal
        visible={webTerminalConfirmModalVisible}
        setVisible={setWebTerminalConfirmModalVisible}
        host={current}
      />
    </>
  );
};

export default DetailHeader;
