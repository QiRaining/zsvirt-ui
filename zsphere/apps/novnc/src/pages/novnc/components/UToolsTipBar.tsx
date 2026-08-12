import { gql, useMutation, useQuery } from "@apollo/client";
import { Alert } from "@zstack/design";
import type { GlobalConfig } from "@zstack/zsphere-types/graphql";
import React, { useContext, useEffect, useMemo, useCallback } from "react";
import { useIntl } from "react-intl";
import { v4 as uuidv4 } from "uuid";

import NoVncContext, { ConnectState } from "../context";

import style from "./style.module.less";

const GLOBAL_CONFIG = gql`
  query globalConfig($category: String!, $name: String!) {
    globalConfig(category: $category, name: $name) {
      value
    }
  }
`;

const ATTACH_GUEST_TOOLS_ISO_TO_VM = gql`
  mutation attachGuestToolsIsoToVm($input: AttachGuestToolsIsoToVmInput!) {
    attachGuestToolsIsoToVm(input: $input) {
      actionId
    }
  }
`;

const UToolsTipBar: React.FC = () => {
  const intl = useIntl();

  const { store, setStore } = useContext(NoVncContext);

  const [_guestToolsWindowsInstall, { data, loading }] = useMutation(
    ATTACH_GUEST_TOOLS_ISO_TO_VM,
  );

  const { data: loginConfig, loading: configLoading } = useQuery<{
    globalConfig: GlobalConfig;
  }>(GLOBAL_CONFIG, {
    variables: {
      category: "ui",
      name: "vm.check.guest.tools",
    },
  });

  const guestToolsWindowsInstall = useCallback(
    (event: React.MouseEvent) => {
      event?.preventDefault();
      if (loading) {
        return;
      }
      if (store?.options?.vmCdRoms) {
        const actionUuid = uuidv4().replace(/-/g, "");
        _guestToolsWindowsInstall({
          variables: {
            input: {
              payload: { uuid: store?.options?.uuid },
              action: {
                name: intl.formatMessage({
                  id: "installGuestTools",
                  defaultMessage: "Install VMTools",
                }),
                total: 1,
                actionId: actionUuid,
              },
            },
          },
        });
      }
    },
    [
      store?.options?.uuid,
      store?.options?.vmCdRoms,
      intl,
      _guestToolsWindowsInstall,
      loading,
    ],
  );

  useEffect(() => {
    if (data) {
      setStore?.((pre) => ({
        ...pre,
        options: {
          ...pre?.options,
          guestToolsInstalled: true,
          lowVersion: false,
        },
      }));
    }
  }, [data, setStore]);

  const ConnectAlert = useMemo(() => {
    ///

    if (
      store?.connectState === ConnectState.disconnect &&
      store.reconnectTimes >= 30
    ) {
      return (
        <Alert className={style.errorTip} closable variant="danger">
          {intl.formatMessage({
            id: "connect.host.failed",
            defaultMessage: "Could not connect to VM. Exist this page, check the resource state, and relaunch the VM console.",
          })}
        </Alert>
      );
    }
    return null;
  }, [store, intl]);

  const onClose = useCallback(
    (index: number) => () => {
      if (index === 0) {
        setStore?.((pre) => ({
          ...pre,
          options: {
            ...pre?.options,
            guestToolsInstalled: true,
          },
        }));
      } else {
        setStore?.((pre) => ({
          ...pre,
          options: {
            ...pre?.options,
            lowVersion: false,
          },
        }));
      }
    },
    [setStore],
  );

  const PerformanceToolAlert = useMemo(() => {
    const { platform } = store?.options ?? {};
    const guestToolsTipVisible = !store?.options?.guestToolsInstalled;
    const guestToolsUpdateTipVisible = store?.options?.lowVersion;

    let guestToolsTipMsg: React.ReactNode = "";
    let guestToolsUpdateTipMsg: React.ReactNode = "";

    if (guestToolsTipVisible) {
      if (platform?.toLowerCase() === "windows") {
        guestToolsTipMsg = (
          <>
            <span>
              {intl.formatMessage({
                id: "windowsTooltip",
                defaultMessage:
                  "VMTools is not installed on this VM. To improve VM performance, log in to the system and",
              })}
            </span>
            <a className={style.link} onClick={guestToolsWindowsInstall}>
              {intl.formatMessage({
                id: "windowsTooltipInstall",
                defaultMessage: "click Install Guest Tools",
              })}
            </a>
          </>
        );
      } else {
        guestToolsTipMsg = intl.formatMessage({
          id: "linuxTooltip",
          defaultMessage: `VMTools is not installed on this VM. To improve VM performance, go to the VM details page to install VMTools.`,
        });
      }
    }

    if (guestToolsUpdateTipVisible) {
      if (platform?.toLowerCase() === "windows") {
        guestToolsUpdateTipMsg = (
          <>
            <span>
              {intl.formatMessage({
                id: "windowsUpdateTooltip",
                defaultMessage:
                  "The current VMTools version is low, log in to the virtual machine to perform an upgrade.",
              })}
            </span>
            <a className={style.link} onClick={guestToolsWindowsInstall}>
              {intl.formatMessage({
                id: "goto.windowsUpdate",
                defaultMessage: "Upgrade",
              })}
            </a>
          </>
        );
      } else {
        guestToolsUpdateTipMsg = intl.formatMessage({
          id: "linuxUpdateTooltip",
          defaultMessage: `The current VMTools version is low. To improve the VM performance, go to the VM details page and follow the instructions to reinstall it.`,
        });
      }
    }

    if (configLoading || loginConfig?.globalConfig?.value === "false") {
      return null;
    }

    return [guestToolsTipMsg, guestToolsUpdateTipMsg].map((msg, index) => {
      const variant = index === 0 ? "info" : ("warning" as const);

      return (
        msg && (
          <Alert
            className={index === 0 ? style.infoTip : style.warningTip}
            key={variant}
            variant={variant}
            closable
            onClose={() => onClose(index)}
          >
            {msg}
          </Alert>
        )
      );
    });
  }, [store, intl, onClose, guestToolsWindowsInstall]);

  return (
    <>
      {ConnectAlert}
      {PerformanceToolAlert}
    </>
  );
};

export default UToolsTipBar;
