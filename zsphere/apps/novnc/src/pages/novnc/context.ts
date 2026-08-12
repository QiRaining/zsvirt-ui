import type RFB from "@novnc/novnc/core/rfb";
import CryptoJS from "crypto-js";
import React from "react";

import { readQueryVariable } from "./utils/utils";

export enum ConnectState {
  connect = "connect",
  disconnect = "disconnect",
  pendingRevertSnapshot = "pendingRevertSnapshot",
  unknow = "unknow",
}

export enum PasswordState {
  wrong = "wrong",
  right = "right",
  unknow = "unknow",
  changed = "changed",
}
export interface RFBOptions {
  compressionLevel: number;
  quality: number;
  viewOnly: boolean;
  scaleViewport: boolean;
  clipViewport: boolean;
  reconnect: boolean;
  showDotCursor: boolean;
}

// Ctrl Alt Win 能够多选

export interface KeyTableItem {
  key: string;
  keysym?: number;
  code?: string;
  text: string;
  down?: boolean;
}
export const keyTable: KeyTableItem[] = [
  {
    key: "ctrl",
    keysym: 0xffe3,
    code: "ControlLeft",
    text: "Ctrl",
    down: true,
  },
  {
    key: "alt",

    keysym: 0xffe9,
    code: "AltLeft",
    text: "Alt",
    down: true,
  },
  // super: {
  //   keysym: 0xffeb,
  //   code: 'MetaLeft',
  //   text:''
  // },
  {
    key: "meta",

    keysym: 0xffe7,
    code: "MetaLeft",
    text: "Win",
  },
  {
    key: "tab",
    keysym: 0xff09,
    code: "Tab",
    text: "Tab",
  },
  {
    key: "esc",

    keysym: 0xff1b,
    code: "Escape",
    text: "Esc",
  },
  {
    key: "ctrlaltdel",

    text: "Ctrl+Alt+Del",
  },
];

export type TKeyType = keyof typeof keyTable;

export interface UrlOptions {
  referer?: string;
  desktopName: string;
  platform: string;
  guestToolsInstalled: boolean;
  lowVersion: boolean;
  host: string;
  ip: string;
  port: number;
  protocol: string;
  vmCdRoms: boolean;
  uuid: string;
  language: string;
  token: string;
  url: string;
}

export interface NoVncProps {
  rfbOptions: RFBOptions;
  options: UrlOptions;

  rfbControl?: RFBControl;
  rfbKeyPressStatus?: RFBKeyPressStatus;
  rfbPressedKeys?: string[];
  statusText?: string;
  connectState?: ConnectState;
  passwordState?: PasswordState;
  isCredentialsRequired?: boolean;
  isSecurityFailure?: boolean;
  reconnectTimes: number;

  actionModalVisible?: boolean;
}

export interface NoVncContextProps {
  store?: NoVncProps;
  setStore?: React.Dispatch<React.SetStateAction<NoVncProps>>;
}

export interface RFBKeyPressStatus {
  ctrl?: boolean;
  alt?: boolean;
  super?: boolean;
}

export class RFBControl {
  private _rfb: typeof RFB;

  constructor(rfb: typeof RFB, options?: RFBOptions) {
    this._rfb = rfb;
    Object.assign(this._rfb, options);
  }

  dragViewport(_dragViewport?: boolean) {
    if (_dragViewport === undefined) {
      this._rfb.dragViewport = !this._rfb.dragViewport;
    } else {
      this._rfb.dragViewport = _dragViewport;
    }
  }

  viewOnly(_viewOnly?: boolean) {
    if (_viewOnly === undefined) {
      this._rfb.viewOnly = !this._rfb._viewOnly;
    } else {
      this._rfb.viewOnly = _viewOnly;
    }
  }

  qualityLevel(_qualityLevel: number) {
    if (!Number.isNaN(_qualityLevel)) {
      this._rfb.qualityLevel = _qualityLevel;
    }
  }

  compressionLevel(_compressionLevel: number) {
    if (!Number.isNaN(_compressionLevel)) {
      this._rfb.compressionLevel = _compressionLevel;
    }
  }

  /**
   *
   * @param keysym RFB keysym
   * @param code dom KeyboardEvent.code
   * @param down 是否是按下还是释放，undefined 发送按下和释放 按钮
   */
  keyClick(keysym?: number, code?: string, down?: boolean) {
    this._rfb.sendKey(keysym, code, down);
  }

  sendCredentials(password: string) {
    this._rfb.sendCredentials({
      password,
    });
  }

  sendCtrlAltDel() {
    this._rfb.sendCtrlAltDel();
  }

  focus() {
    this._rfb.focus();
  }

  get rfb() {
    return this._rfb;
  }
}

export const getInitOptions = () => {
  const cachedValue = sessionStorage.getItem("zsVncInitOptions");
  if (!window.location.search && cachedValue) {
    try {
      return JSON.parse(cachedValue);
    } catch {
      sessionStorage.removeItem("zsVncInitOptions");
    }
  }
  const encryption = readQueryVariable("encryption", "");
  let params;
  if (encryption) {
    const q = readQueryVariable("q", "");
    params = JSON.parse(
      CryptoJS.enc.Base64.parse(q).toString(CryptoJS.enc.Utf8),
    );
  } else {
    params = {
      referer: readQueryVariable("referer", ""),
      token: readQueryVariable("token", ""),
      title: readQueryVariable("title", ""),
      platform: readQueryVariable("platform", ""),
      ip: readQueryVariable("ip", ""),
      guestToolsInstalled: readQueryVariable("guestToolsInstalled", ""),
      lowVersion: readQueryVariable("lowVersion", false),
      vmCdRoms: readQueryVariable("vmCdRoms", ""),
      uuid: readQueryVariable("uuid", ""),
      language: readQueryVariable("language", "zh-CN"),
      view_only: readQueryVariable("view_only", false),
      scales: readQueryVariable("scale", false),
      host: readQueryVariable("host", window.location.hostname),
      port: readQueryVariable("port", window.location.port),
    };
  }
  // const params = JSON.parse(CryptoJS.enc.Base64.parse(q))

  const [protocol, host, port, path, token] = [
    window.location.protocol === "https:" ? "wss" : "ws",
    params.host,
    params.port,
    "websockify",
    params?.token,
  ];

  const url = `${protocol}://${host}:${port}/${path}?token=${token}`;

  const options = {
    referer: params?.referer,
    desktopName: params?.title,
    platform: params?.platform,
    ip: params?.ip,
    guestToolsInstalled: ["true", ""].includes(params?.guestToolsInstalled),
    lowVersion: params?.lowVersion === "true",
    host,
    port,
    protocol,
    vmCdRoms: params?.vmCdRoms === "true",
    uuid: params?.uuid,
    language: params?.language || "zh-CN",
    token: params?.token || "",
    url,
  };

  const rfbOptions = {
    viewOnly: params?.view_only,
    scaleViewport: params?.scale,
    clipViewport: true,
    showDotCursor: true,
    reconnect: true,
    compressionLevel: 2,
    quality: 6,
  };

  const result = {
    options,
    rfbOptions,
    reconnectTimes: 0,
    actionModalVisible: false,
  };

  try {
    sessionStorage.setItem("zsVncInitOptions", JSON.stringify(result));
  } catch {
    // ignore
  }

  return result;
};

const noVncContext = React.createContext<NoVncContextProps>({});

export default noVncContext;
