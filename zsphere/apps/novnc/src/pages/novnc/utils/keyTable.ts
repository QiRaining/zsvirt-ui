export type TKeyType =
  | "ctrl"
  | "alt"
  | "super"
  | "tab"
  | "esc"
  | "ctrlaltdel"
  | "meta";

export default {
  ctrl: {
    keysym: 0xffe3,
    code: "ControlLeft",
  },
  alt: {
    keysym: 0xffe9,
    code: "AltLeft",
  },
  super: {
    keysym: 0xffeb,
    code: "MetaLeft",
  },
  meta: {
    keysym: 0xffe7,
    code: "MetaLeft",
  },
  tab: {
    keysym: 0xff09,
    code: "Tab",
  },
  esc: {
    keysym: 0xff1b,
    code: "Escape",
  },
};
