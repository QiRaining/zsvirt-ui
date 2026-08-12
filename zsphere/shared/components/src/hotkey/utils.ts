import { capitalize } from "lodash-es";

import { keyCodeMap, functionKeys } from "./key-map";
import { IConfig, ICommandInfo, IKeyConfig, ISubCommand } from "./type";

enum Modifier {
  Ctrl = 1,
  Shift = 2,
  Alt = 4,
  Meta = 8,
}

const isMac = navigator.userAgent.indexOf("Macintosh") >= 0;

export function getKeyBindingHashFromExpr(keyExpr: string) {
  const [key, ...modifiers] = keyExpr.split("+").reverse();
  let modifier = 0;
  for (const m of modifiers) {
    switch (m) {
      case "ctrl":
        modifier |= Modifier.Ctrl;
        break;
      case "shift":
        modifier |= Modifier.Shift;
        break;
      case "alt":
        modifier |= Modifier.Alt;
        break;
      case "meta":
        modifier |= Modifier.Meta;
        break;
      case "accel":
        modifier |= isMac ? Modifier.Meta : Modifier.Ctrl;
        break;
    }
  }
  return `${modifier}-${keyCodeMap.get(key)}`;
}

export function getKeyBindingHashFromEvent(e: KeyboardEvent) {
  let modifier = 0;
  if (e.ctrlKey) {
    modifier |= Modifier.Ctrl;
  }
  if (e.shiftKey) {
    modifier |= Modifier.Shift;
  }
  if (e.altKey) {
    modifier |= Modifier.Alt;
  }
  if (e.metaKey) {
    modifier |= Modifier.Meta;
  }
  return `${modifier}-${e.code}`;
}

const modifierLabel: Record<string, string> = isMac
  ? {
      ctrl: "\u2303",
      shift: "⇧",
      alt: "⌥",
      meta: "⌘",
      accel: "⌘",
    }
  : {
      ctrl: "Ctrl",
      shift: "Shift",
      alt: "Alt",
      meta: "Win",
      accel: "Ctrl",
    };

function getKeyLabel(key: string) {
  switch (key) {
    case "enter":
      return "↩\ufe0e";
    case "tab":
      return "⇥";
    case "up":
      return "↑";
    case "down":
      return "↓";
    case "left":
      return "←";
    case "right":
      return "→";
    default:
      return capitalize(key);
  }
}

export function getHotkeyLabelFromExpr(keyExpr: string) {
  const [key, ...modifiers] = keyExpr.split("+").reverse();
  return modifiers
    .map((m) => modifierLabel[m])
    .concat(getKeyLabel(key))
    .join("+");
}

function getSubCommands(key: IKeyConfig): ISubCommand[] {
  if (typeof key === "string") {
    return [{ name: "", key }];
  }
  if (Array.isArray(key)) {
    return key.map((k) => ({ name: k, key: k }));
  }
  return Object.entries(key).map(([name, k]) => ({ name, key: k }));
}

export function getCommandInfoFromConfig({
  command: id,
  key,
}: IConfig): ICommandInfo {
  const keyLabelMap = new Map<string, string>();
  const keyLabelList = [] as string[];
  const subCommands = getSubCommands(key);
  subCommands.forEach((cmd) => {
    const keyLabel = getHotkeyLabelFromExpr(cmd.key);
    keyLabelMap.set(cmd.name, keyLabel);
    keyLabelList.push(keyLabel);
  });
  const keyLabel = keyLabelList.join(" ");
  return { id, keyLabel, keyLabelMap };
}

export function createCommandKeyMap(config: IConfig[]) {
  const commandKeyMap = new Map<string, IConfig>();
  const keyHashToCommandMap = new Map<
    string,
    Array<{ id: string; arg?: string }>
  >();

  config.forEach((item) => {
    commandKeyMap.set(item.command, item);
    const subCommands = getSubCommands(item.key);
    subCommands.forEach((cmd) => {
      const keyHash = getKeyBindingHashFromExpr(cmd.key);
      let cmdList = keyHashToCommandMap.get(keyHash);
      if (!cmdList) {
        cmdList = [];
        keyHashToCommandMap.set(keyHash, cmdList);
      }
      cmdList.push({ id: item.command, arg: cmd.name });
    });
  });

  return { commandKeyMap, keyHashToCommandMap };
}

export function isEditingContent(e: KeyboardEvent) {
  const elem = e.target as HTMLElement;
  const tagName = elem.tagName;

  return (
    elem.isContentEditable ||
    tagName === "INPUT" ||
    tagName === "SELECT" ||
    tagName === "TEXTAREA"
  );
}

export function isFunctionKey(e: KeyboardEvent) {
  return functionKeys.has(e.code);
}

export function isModifierKeyPressed(e: KeyboardEvent) {
  return e.ctrlKey || e.altKey || e.metaKey;
}

export function isAntdModalOpen() {
  return (
    !!document.activeElement?.closest(".ant-modal-wrap") ||
    !!document.body.querySelector(":scope > div > .ant-drawer-open")
  );
}
