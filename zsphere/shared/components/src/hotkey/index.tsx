import { usePersistFn } from "ahooks";
import { Tooltip } from "antd";
import React, { useEffect, useMemo, useRef } from "react";

import Link from "../link";
import config from "./config";
import { ICommand, ICommandParam, ICommandLinkProps } from "./type";
import {
  isAntdModalOpen,
  createCommandKeyMap,
  getKeyBindingHashFromEvent,
  isEditingContent,
  isFunctionKey,
  isModifierKeyPressed,
  getCommandInfoFromConfig,
} from "./utils";

const commandMap = new Map<string, ICommand>();
const { commandKeyMap, keyHashToCommandMap } = createCommandKeyMap(config);

export function useRegisterHotKeyListener() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        isAntdModalOpen() ||
        (isEditingContent(e) && !isModifierKeyPressed(e) && !isFunctionKey(e))
      ) {
        return;
      }
      const key = getKeyBindingHashFromEvent(e);
      const subCommands = keyHashToCommandMap.get(key) ?? [];
      for (const { id, arg } of subCommands) {
        const command = commandMap.get(id);
        if (command?.when(arg)) {
          e.preventDefault();
          command.fn(arg);
          break;
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}

export function useCommandInfoMap() {
  return useMemo(() => {
    return new Map(
      config.map((item) => [item.command, getCommandInfoFromConfig(item)]),
    );
  }, []);
}

export function useCommandInfo(id: string) {
  const commandInfo = useMemo(() => {
    if (commandKeyMap.has(id)) {
      return getCommandInfoFromConfig(commandKeyMap.get(id)!);
    }
    return null;
  }, [id]);
  return commandInfo;
}

export function useRegisterCommand(command: ICommandParam) {
  const fn = usePersistFn((arg?: string) => command.fn(arg));
  const when = usePersistFn(
    (arg?: string) => !command.when || command.when(arg),
  );
  useEffect(() => {
    if (!command.id || commandMap.has(command.id)) {
      return;
    }
    commandMap.set(command.id, { id: command.id, fn, when });
    return () => {
      commandMap.delete(command.id);
    };
  }, [fn, when, command.id]);
  const commandInfo = useMemo(() => {
    if (command.id && commandKeyMap.has(command.id)) {
      return getCommandInfoFromConfig(commandKeyMap.get(command.id)!);
    }
    return null;
  }, [command.id]);
  return [fn, commandInfo] as const;
}

export function CommandLink({
  command,
  wrapperClassName,
  ...props
}: ICommandLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  const [, commandInfo] = useRegisterCommand({
    id: command?.id ?? "",
    fn: () => {
      linkRef.current?.click();
    },
    when: () => !!linkRef.current,
  });

  if (!command?.tooltipProps) {
    return (
      <div className={wrapperClassName}>
        <Link {...props} innerRef={linkRef} />
      </div>
    );
  }

  let title = command.tooltipProps.title;
  if (commandInfo?.keyLabel) {
    title = `${title} (${commandInfo.keyLabel})`;
  }

  return (
    <Tooltip {...command.tooltipProps} title={title}>
      <div className={wrapperClassName}>
        <Link {...props} innerRef={linkRef} />
      </div>
    </Tooltip>
  );
}
