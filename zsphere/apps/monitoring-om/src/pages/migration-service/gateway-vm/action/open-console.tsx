import { gql } from "@apollo/client";
import { ITaskResult, useAction } from "@zstack/zsphere-hooks";
import { UIExtendedLicenseType } from "@zstack/zsphere-types";
import type { Item } from "@zstack/zsphere-types";
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

const useOpenConsoleAction = () => {
  const intl = useIntl();
  const doAction = useAction();

  const openVncConsole = React.useCallback(
    (current: Item, onFinish: () => void = () => {}) => {
      const payload = {
        getToolsInfo: false,
        vmInstanceUuid: current?.uuid,
        type: current?.type,
        hypervisorType: current?.hypervisorType,
        platform: current?.platform,
        hostUuid: current?.hostUuid,
        state: current?.state,
        licenseType: UIExtendedLicenseType.Community,
      };

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
            const { hostname, port, token } = result ?? {};
            let querys: Record<string, unknown> = {
              referer: window.origin,
              host: hostname,
              port,
              token,
              title: current?.name,
              vmCdRoms: "true",
              uuid: current?.uuid,
              language: intl.locale,
              ip: current?.defaultIp ?? "",
            };

            querys = {
              ...querys,
              isGatewayVm: "true",
            };

            const q = CryptoJS.enc.Base64.stringify(
              CryptoJS.enc.Utf8.parse(JSON.stringify(querys)),
            );
            querys = { q, encryption: true };
            const baseUrl =
              window.location.origin?.indexOf("https") === 0
                ? window.location.origin.replace(
                    window.location.hostname,
                    hostname,
                  )
                : window.location.origin;
            const searchParam = new URLSearchParams();
            Object.entries(querys).forEach(([key, value]) => {
              searchParam.set(key, value as string);
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
              const timeoutPromise = new Promise<void>((_resolve, reject) => {
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
          }
        },
        onFinish,
      });
    },
    [intl, doAction],
  );

  return openVncConsole;
};

export default useOpenConsoleAction;
