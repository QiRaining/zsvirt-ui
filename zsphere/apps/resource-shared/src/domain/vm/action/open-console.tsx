import { gql } from "@apollo/client";
import type { ITaskResult } from "@zstack/zsphere-hooks";
import { useAction } from "@zstack/zsphere-hooks";
import { UIExtendedLicenseType } from "@zstack/zsphere-types";
import type { VmInstance as IVM } from "@zstack/zsphere-types/graphql";
import CryptoJS from "crypto-js";
import React from "react";
import { useIntl } from "react-intl";

const openConsoleAccess = gql`
  mutation openConsoleAccess($input: OpenConsoleInput!) {
    openConsoleAccess(input: $input) {
      actionId
    }
  }
`;
export const useOpenVnc = (options: {
  getPayload: (current: any) => any;
  openNoVncCb: (result: any, current: any, payload: any) => void;
}) => {
  const { getPayload, openNoVncCb } = options;
  const intl = useIntl();
  const doAction = useAction();

  const openVncConsole = React.useCallback(
    (current: any, onFinish: () => void = () => {}) => {
      const payload = getPayload(current);
      doAction({
        mutation: openConsoleAccess,
        payload,
        name: intl.formatMessage({
          id: "open.console",
          defaultMessage: "Launch Console",
        }),
        total: 1,
        forceRunCallback: true,
        onProgress: (results: ITaskResult) => {
          const result = results?.inventory;
          if (result) {
            openNoVncCb(result, current, payload);
          }
        },
        onFinish,
      });
    },
    [getPayload, openNoVncCb, intl, doAction],
  );

  return { openVncConsole };
};
const getVMIp = (current: IVM, ipVersion = 4) => {
  const { vmNics, defaultL3NetworkUuid } = current;
  const defaultip = vmNics
    ?.find((nic) => nic.l3NetworkUuid === defaultL3NetworkUuid)
    ?.usedIps?.find((ip) => ip.ipVersion === ipVersion)?.ip;

  return defaultip ?? "";
};
const useOpenConsoleAction = () => {
  const intl = useIntl();

  const getPayload = React.useCallback((current: IVM) => {
    return {
      // ZSV-7781, ZSV-7380, 不展示vmtools横幅
      getToolsInfo: false,
      vmInstanceUuid: current && current.uuid,
      type: current?.type,
      hypervisorType: current?.hypervisorType,
      platform: current?.platform,
      hostUuid: current?.hostUuid,
      state: current?.state,
      licenseType: UIExtendedLicenseType.Community,
    };
  }, []);
  const openNoVncCb = React.useCallback(
    (result: any, current: any, payload: any) => {
      const { hostname, port, token } = result ?? {};
      let querys: any = {
        referer: window.origin,
        host: hostname,
        port,
        token,
        title: current?.name,
        vmCdRoms: "true",
        uuid: payload.vmInstanceUuid,
        language: intl.locale,
        ip: getVMIp(current),
      };

      const q = CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Utf8.parse(JSON.stringify(querys)),
      );
      querys = { q, encryption: true };
      const baseUrl =
        window.location.origin?.indexOf("https") === 0
          ? window.location.origin.replace(window.location.hostname, hostname)
          : window.location.origin;
      const searchParam = new URLSearchParams();
      Object.entries(querys).forEach(([key, value]) => {
        searchParam.set(key, value as any);
      });
      const novncWindow = window.open(
        `${baseUrl}/novnc?${searchParam.toString()}`,
      );
      if (novncWindow) {
        let handleMessage: (e: MessageEvent) => void;
        const onReadyPromise = new Promise<void>((resolve) => {
          handleMessage = (e: MessageEvent) => {
            if (
              e.origin === baseUrl &&
              e.source === novncWindow &&
              e.data?.type === "novnc-action-loaded"
            ) {
              resolve();
            }
          };
          window.addEventListener("message", handleMessage);
        });
        const timeoutPromise = new Promise<void>((resolve, reject) => {
          setTimeout(() => {
            reject();
          }, 60 * 1000);
        });
        Promise.race([onReadyPromise, timeoutPromise])
          .then(() => {
            const sessionId = localStorage.getItem("sessionId");
            const authList = JSON.parse(
              localStorage.getItem("authList") || "[]",
            );
            novncWindow.postMessage(
              {
                type: "novnc-set-session-context",
                sessionId: sessionId ?? undefined,
                authList,
              },
              baseUrl,
            );
          })
          .catch(() => {
            // ignore
          })
          .finally(() => {
            window.removeEventListener("message", handleMessage);
          });
      }
    },
    [intl.locale],
  );
  const { openVncConsole } = useOpenVnc({ getPayload, openNoVncCb });

  return openVncConsole;
};

export default useOpenConsoleAction;
