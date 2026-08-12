import { gql } from "@apollo/client";
import RFB from "@novnc/novnc/core/rfb";
import { useActionSubscribe, useAction } from "@zstack/zsphere-hooks";
import { ActionTaskState } from "@zstack/zsphere-types";
import { useMount } from "ahooks";
import { Layout } from "antd";
import CryptoJS from "crypto-js";
import { omit } from "lodash-es";
import React, { useEffect, useRef, useContext } from "react";
import { useIntl } from "react-intl";
import { useSearchParams } from "react-router";

import NoVncContext, {
  ConnectState,
  PasswordState,
  RFBControl,
} from "../context";
import NoVncPasswordModal from "./NoVncPasswordModal";
import UToolsTipBar from "./UToolsTipBar";

import style from "./style.module.less";

const openConsoleAccess = gql`
  mutation openConsoleAccess($input: OpenConsoleInput!) {
    openConsoleAccess(input: $input) {
      actionId
    }
  }
`;

const { Content } = Layout;

const NoVNCContent: React.FC = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setStore, store } = useContext(NoVncContext);
  let timer: any;

  //重连次数 ，后期删除

  const { url, desktopName } = store?.options ?? {};

  const screenRef = useRef<HTMLDivElement>(null);
  const storeRef = useRef<any>(null);
  storeRef.current = store;

  useEffect(() => {
    if (desktopName) {
      document.title = desktopName;
    }
  }, [desktopName]);

  const init = async () => {
    if (desktopName) {
      document.title = desktopName;
    }
    const newRfb = await new RFB(
      screenRef.current,
      storeRef.current?.options?.url,
      {
        wsProtocols: "binary",
        scaleViewport: true,
      },
    );

    const rfbControl = new RFBControl(newRfb, store?.rfbOptions);

    newRfb.scaleViewport = true;

    newRfb.addEventListener("connect", () => {
      newRfb.focus();

      setStore?.((pre) => {
        const data = {
          ...pre,
          reconnectTimes: 0,
          connectState: ConnectState.connect,
          passwordState: PasswordState.right,
        };

        // data = { ...data, passwordState: PasswordState.right }
        return data;
      });
    });

    newRfb.addEventListener("disconnect", () => {
      if (window.opener) {
        window.opener.postMessage(
          {
            source: "novnc",
            type: "disconnect",
            uuid: storeRef.current?.options?.uuid,
          },
          "*",
        );
      }
      ///
      if (
        storeRef.current?.reconnectTimes < 30 ||
        storeRef.current?.connectState === ConnectState.pendingRevertSnapshot
      ) {
        timer = setInterval(() => {
          if (window.history) {
            clearInterval(timer);
            init();
            setStore?.((pre) => ({
              ...pre,
              reconnectTimes: pre?.reconnectTimes + 1,
            }));
          }
        }, 1000);
      }
      if (
        storeRef.current?.passwordState !== PasswordState.wrong &&
        storeRef.current?.connectState !== ConnectState.pendingRevertSnapshot
      ) {
        setStore?.((pre) => ({
          ...pre,
          connectState: ConnectState.disconnect,
        }));
      }
    });
    newRfb.addEventListener("credentialsrequired", () => {
      if (storeRef.current?.passwordState !== PasswordState.wrong) {
        setStore?.((pre) => {
          return {
            ...pre,
            passwordState: PasswordState.wrong,
          };
        });
      }
    });
    newRfb.addEventListener("desktopname", (e: any) => {
      setStore?.((pre) => ({
        ...pre,
        options: {
          ...pre?.options,
          desktopname: e.detail.name,
        },
      }));
    });
    newRfb.addEventListener("securityfailure", () => {
      if (storeRef.current?.passwordState === PasswordState.changed) {
        init();
      }
      setStore?.((pre) => ({
        ...pre,
        passwordState: PasswordState.wrong,
      }));
    });

    setTimeout(() => {
      // 这个设置依赖渲染节点
      newRfb.showDotCursor = store?.rfbOptions?.showDotCursor;
    }, 0);

    setStore?.((pre) => ({
      ...pre,
      rfbControl,
    }));
  };

  useMount(() => {
    init();
  });

  const doAction = useAction();

  useActionSubscribe({
    resourceTypeList: ["VolumeSnapshot", "VolumeSnapshotGroup"],
    onProgress: async (result) => {
      let vmInstanceUuid: string | undefined;
      try {
        vmInstanceUuid = JSON.parse(result.inventory ?? "{}")?.uuid;
      } catch {
        // ignore
      }
      if (
        vmInstanceUuid &&
        vmInstanceUuid === storeRef.current?.options?.uuid &&
        result.listenerType === "RevertVmFromSnapshotGroupWithMemory"
      ) {
        switch (result.state) {
          case ActionTaskState.running:
            setStore?.((prev) => ({
              ...prev,
              connectState: ConnectState.pendingRevertSnapshot,
            }));
            break;
          case ActionTaskState.fail:
            setStore?.((prev) => ({
              ...prev,
              connectState: ConnectState.disconnect,
            }));
            break;
          case ActionTaskState.success:
            doAction({
              mutation: openConsoleAccess,
              payload: [{ vmInstanceUuid }],
              total: 1,
              name: intl.formatMessage({
                id: "open.console",
                defaultMessage: "Launch Console",
              }),
              type: "VmInstance",
              silent: true,
              onFinish: (actionResult) => {
                if (!actionResult.inventory) {
                  setStore?.((prev) => ({
                    ...prev,
                    connectState: ConnectState.disconnect,
                  }));
                  return;
                }
                const { hostname, port, token } = actionResult.inventory;
                const newUrl = new URL(storeRef.current?.options?.url ?? url);
                newUrl.hostname = hostname;
                newUrl.port = port;
                newUrl.searchParams.set("token", token);
                const newStoreState = {
                  ...storeRef.current,
                  options: {
                    ...storeRef.current?.options,
                    host: hostname,
                    port,
                    token,
                    url: newUrl.toString(),
                  },
                };
                setStore?.(newStoreState);
                sessionStorage.setItem(
                  "zsVncInitOptions",
                  JSON.stringify(omit(newStoreState, "rfbControl")),
                );
                if (window.location.search) {
                  const encryptedParams = searchParams.get("q");
                  if (encryptedParams && searchParams.get("encryption")) {
                    const newParam = JSON.parse(
                      CryptoJS.enc.Base64.parse(encryptedParams).toString(
                        CryptoJS.enc.Utf8,
                      ),
                    );
                    newParam.token = token;
                    newParam.host = hostname;
                    newParam.port = port;
                    searchParams.set(
                      "q",
                      CryptoJS.enc.Base64.stringify(
                        CryptoJS.enc.Utf8.parse(JSON.stringify(newParam)),
                      ),
                    );
                  } else {
                    searchParams.set("token", token);
                    searchParams.set("host", hostname);
                    searchParams.set("port", port);
                  }
                  setSearchParams(searchParams, { replace: true });
                }
              },
            });
            break;
          default:
        }
      }
    },
  });

  return (
    <Content className={style.content}>
      <NoVncPasswordModal />
      <UToolsTipBar />
      <div ref={screenRef} className={style.rfb} />
    </Content>
  );
};

export default NoVNCContent;
