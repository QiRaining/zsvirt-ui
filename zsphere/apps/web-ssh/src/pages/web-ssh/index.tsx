import { debounce } from "lodash-es";
import React from "react";
import { useIntl } from "react-intl";
import { useLocation } from "react-router";
import { Terminal } from "xterm";

import "xterm/css/xterm.css";
import { AttachAddon } from "./attach-addon";
import { FitAddon } from "./fit-addon";
import WebSshHeader, { HeaderAlert } from "./header";
import {
  addDomListener,
  termOptions,
  useValidToken,
  useDataSubscription,
  validIsLoginout,
  useWebsocketData,
} from "./utils";

import style from "./style.module.less";

const WebSsh: React.FC = () => {
  useDataSubscription();
  const { search } = useLocation();
  const [visible, setVisible] = React.useState(false);
  const [msg, setMsg] = React.useState("");
  const intl = useIntl();
  const [terminal, setTerminal] = React.useState<HTMLDivElement>();
  const termRef = React.useRef<Terminal>();
  const socketRef = React.useRef<WebSocket>();

  const fit = React.useRef<any>();
  const searchParams = new URLSearchParams(search);
  const ip = searchParams.get("ip");
  const sn = searchParams.get("sn");
  const title = searchParams.get("title");
  const port = searchParams.get("wsPort");
  const urlPrefix = window.location.protocol === "https:" ? "wss" : "ws";
  const url = `${urlPrefix}://{{ip}}:${port}/ws?id=${searchParams.get("wsId")}`;
  const { socketTimeout, error } = useWebsocketData();
  const validDataError = useValidToken();

  const isLoginout = React.useMemo(() => {
    return validIsLoginout(error) || validIsLoginout(validDataError);
  }, [validDataError, error]);

  React.useEffect(() => {
    if (isLoginout) {
      socketRef.current?.close();
      setVisible(true);
      setMsg(
        intl.formatMessage({
          defaultMessage: "Cannot Connect Host",
          id: "webssh.connect.failed",
        }),
      );
    }
  }, [intl, isLoginout]);

  React.useEffect(() => {
    if (terminal && url && socketTimeout !== undefined) {
      const websocketUrl = url.replace("{{ip}}", window.location.hostname);
      const term: any = new Terminal(termOptions);
      termRef.current = term;
      const webSocket = new WebSocket(websocketUrl);
      socketRef.current = webSocket;
      const attachAddon = new AttachAddon(webSocket, {
        socketTimeout,
        closeWebSocketCallback: () => {
          webSocket.close();
          setVisible(true);
          setMsg(
            intl.formatMessage({
              defaultMessage: "Cannot Connect Host",
              id: "webssh.connect.failed",
            }),
          );
        },
        errorWebSocketCallback: () => {
          setVisible(true);
          setMsg(
            intl.formatMessage({
              defaultMessage: "Cannot Connect Host",
              id: "webssh.connect.failed",
            }),
          );
        },
      });

      term.loadAddon(attachAddon);

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(terminal);
      setTimeout(() => {
        fitAddon.fit();
      }, 1000);

      term.onResize((size: any) => {
        console.log("onResize: ", size);

        const { cols, rows } = size ?? {};

        webSocket?.send(JSON.stringify({ resize: [cols, rows] }));
      });
      fit.current = fitAddon;

      const resizeCb = debounce(() => {
        fitAddon?.fit();
      }, 300);

      addDomListener(term, window, "resize", () => {
        resizeCb();
      });
    }
  }, [terminal, url, socketTimeout, intl, isLoginout]);

  const terminalRef = React.useCallback((ele) => {
    if (ele) {
      setTerminal(ele);
    }
  }, []);

  return (
    <div className={style.layout}>
      {visible && <HeaderAlert message={msg} />}
      <WebSshHeader sn={sn!} ip={ip!} title={title!} />
      <div className={style.terminalWrap}>
        <div id="terminal" ref={terminalRef} />
      </div>
    </div>
  );
};

export default WebSsh;
