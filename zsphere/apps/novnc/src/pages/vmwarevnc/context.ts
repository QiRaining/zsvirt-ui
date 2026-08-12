import type RFB from "@novnc/novnc/core/rfb";
import React from "react";

import { readQueryVariable } from "./utils/utils";

export enum ConnectState {
  connect = "connect",
  disconnect = "disconnect",
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

  get rfb() {
    return this._rfb;
  }
}

export const getInitOptions = () => {
  const [protocol, host, port, path, token] = [
    window.location.protocol === "https:" ? "wss" : "ws",
    readQueryVariable("host", window.location.hostname),
    readQueryVariable("port", window.location.port),
    "websockify",
    readQueryVariable("token", ""),
  ];

  const url = `${protocol}://${host}:${port}/${path}?token=${token}`;

  const options = {
    desktopName: readQueryVariable("title", ""),
    platform: readQueryVariable("platform", ""),
    ip: readQueryVariable("ip", ""),
    guestToolsInstalled: ["true", ""].includes(
      readQueryVariable("guestToolsInstalled", ""),
    ),
    lowVersion: readQueryVariable("lowVersion", false) === "true",
    host,
    port,
    protocol,
    vmCdRoms: readQueryVariable("vmCdRoms", "") === "true",
    uuid: readQueryVariable("uuid", ""),
    language: readQueryVariable("language", "zh-CN"),
    url,
  };

  const rfbOptions = {
    viewOnly: readQueryVariable("view_only", false),
    scaleViewport: readQueryVariable("scale", false),
    clipViewport: true,
    showDotCursor: true,
    reconnect: true,
    compressionLevel: 2,
    quality: 6,
  };

  return { options, rfbOptions };
};

const noVncContext = React.createContext<NoVncContextProps>({});

export default noVncContext;
