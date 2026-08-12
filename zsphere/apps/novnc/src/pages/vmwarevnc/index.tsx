// 该文件代码 copy from 原有的wmware vnc html main/public/vmware-console/index.html
// 混杂jquery与外链代码,所以格式多变

import { Icon } from "@zstack/icon";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { useIntl } from "react-intl";

import { PastePopUp } from "../novnc/components/SideBar";
//@ts-expect-error
import * as $ from "./utils/jquery.js";
import { readQueryVariable } from "./utils/utils";

import style from "./style.module.less";

const getDefaultFavicon = (locale?: string) => {
  const effectiveLocale = locale === "en-US" ? "en-US" : "zh-CN";
  return `/public/theme/default/${effectiveLocale}/favicon.ico`;
};

const win: any = window;
const App = () => {
  const [favicon] = useState(() =>
    getDefaultFavicon(readQueryVariable("language", "zh-CN")),
  );
  const [ready, setReady] = useState<boolean>(false);
  const [wmks, setWmks] = useState<any>();
  const [visible, setVisible] = useState<boolean>(false);
  const [status, setStatus] = useState<any>();
  const intl = useIntl();

  let connectPro = false;
  // get vmware sdk
  React.useEffect(() => {
    $.get("/vmware-console/wmks.min.js", function (result: any) {
      if (result) {
        try {
          //@ts-expect-error
          eval.call(result, win);
        } catch (__e) {
          console.error(e);
        }
        setReady(true);
      }
    });

    if (!win.WMKS) {
      return;
    }
    requestAnimationFrame(async () => {
      if (!connectPro) {
        connectPro = true;
        await createWMKS();
      }

      document.title = options.desktopName;
      $("#mainCanvas").css("position", "relative");
      wmks.updateScreen();
    });
  }, []);

  const createWMKS = async () => {
    const pro = new Promise((r, _j) => {
      const _wmks = win.WMKS.createWMKS("wmksContainer", {
        rescale: false,
        position: win.WMKS.CONST.Position.CENTER,
      });
      function onConnectionStateChangeHandler(_: any, _data: any) {
        if (_data.state === "connecting") {
          setStatus(
            intl.formatMessage({
              id: "vmware.connecting",
              defaultMessage: "Connecting",
            }),
          );
        } else if (_data.state === "connected") {
          setStatus(
            intl.formatMessage({
              id: "vmware.connected",
              defaultMessage: "Connected",
            }),
          );
          r(_wmks);
        } else {
          setStatus(
            intl.formatMessage({
              id: "vmware.disconnected",
              defaultMessage: "Disconnected",
            }),
          );
        }
      }

      const constEvent = win.WMKS.CONST.Events;
      _wmks
        .register(
          constEvent.CONNECTION_STATE_CHANGE,
          onConnectionStateChangeHandler,
        )
        .register(constEvent.FULL_SCREEN_CHANGE, onScreenHandler);
      const host = options.host;
      const port = 443;
      const ticket = options.token;
      let url = `ws://${host}:${port}`;
      if (ticket) {
        url = `wss://${host}:${port}${ticket}`;
      }
      console.log("-----0---connect");
      _wmks.connect(url);
    });
    const a = await pro;
    setWmks(a);
  };
  const onScreenHandler = () => {
    wmks.updateScreen();
  };

  const [protocol, host, port, token] = [
    win.location.protocol === "https:" ? "wss" : "ws",
    readQueryVariable("host", win.location.hostname),
    readQueryVariable("port", win.location.port),
    readQueryVariable("token", ""),
  ];

  const options = {
    viewOnly: readQueryVariable("view_only", false),
    desktopName: readQueryVariable("title", ""),
    platform: readQueryVariable("platform", ""),
    guestToolsInstalled: readQueryVariable("guestToolsInstalled", ""),
    lowVersion: readQueryVariable("lowVersion", false),
    changeResolution: true,
    rescale: true,
    showDotCursor: true,
    reconnect: true,
    host,
    port,
    token,
    protocol,
    vmCdRoms: readQueryVariable("vmCdRoms", ""),
    uuid: readQueryVariable("uuid", ""),
    language: readQueryVariable("language", "zh-CN"),
  };

  //初始事件

  function enterFullScreen() {
    if (!wmks) {
      return;
    }
    wmks.enterFullScreen();
  }

  function sendCAD() {
    if (!wmks) {
      return;
    }
    wmks.sendCAD();
  }

  const sendInputstring = (text: string) => {
    if (!wmks) {
      return;
    }
    wmks.sendInputstring(text);
  };
  const paste = () => {
    setVisible(!visible);
  };

  return (
    <div className={style["console-container"]}>
      <Helmet>
        <link rel="shortcut icon" type="images/x-icon" href={favicon} />
      </Helmet>
      {visible && (
        <PastePopUp
          onOk={sendInputstring}
          visible={visible}
          setVisible={setVisible}
        />
      )}
      <div className="status-bar">
        <a id="status" style={{ color: "white" }}>
          {status}
        </a>
        <button
          id="cadBtn"
          type="button"
          className="ctrl-alt-del-btn"
          onClick={sendCAD}
        >
          {intl.formatMessage({
            id: "vmware.paste.cad",
            defaultMessage: "Send Ctrl+Alt+Del",
          })}
        </button>
      </div>
      {!ready && (
        <div id="ca-status-bar" className="ca-status-bar">
          <span className="icon">
            {" "}
            <img
              style={{ height: "16px", width: "16px" }}
              alt=""
              src="/vmware-console/assets/icons/info.svg"
            />
          </span>
          <a
            id="ca-status"
            className="ca-status-bar-text"
            style={{ color: "white" }}
          >
            {intl.formatMessage({
              id: "vmware.console.error",
              defaultMessage:
                "Exception occurs. Log in to the vCenter by using your browser, download the trusted root CA certificate on the login page, and try again.",
            })}
          </a>
        </div>
      )}
      <div
        style={{
          background: "rgb(24, 26, 29)",
          height: "calc(100% - 32px)",
          overflow: "hidden",
        }}
      >
        <div id="wmksContainer" style={{ height: "800px", width: "800px" }}>
          <div className="tools-list">
            <ul className="tools-list-content">
              <li onClick={enterFullScreen}>
                <div className="list-btn">
                  <Icon
                    type="fullscreen"
                    color="neutral"
                    colorNumber={0}
                    size={20}
                  />
                </div>
              </li>
              <li onClick={paste}>
                <div className="list-btn">
                  <Icon
                    type="file-paste"
                    color="neutral"
                    colorNumber={0}
                    size={20}
                  />
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppWrap: React.FC = () => {
  return <App />;
};

export default AppWrap;
