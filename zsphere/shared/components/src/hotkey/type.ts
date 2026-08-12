import { TooltipPropsWithTitle } from "antd/es/tooltip";

import { ILinkProps } from "../link";

export interface ISubCommandKeyConfig {
  [command: string]: string;
}

export type IKeyConfig = string | string[] | ISubCommandKeyConfig;

export interface IConfig {
  command: string;
  key: IKeyConfig;
}

export interface ISubCommand {
  name: string;
  key: string;
}

export interface ICommandParam {
  id: string;
  fn: (arg?: string) => void;
  when?: (arg?: string) => boolean;
}

export type ICommand = Required<ICommandParam>;

export interface ICommandInfo {
  id: string;
  keyLabel: string;
  keyLabelMap: Map<string, string>;
}

export type ICommandLinkProps = ILinkProps & {
  wrapperClassName?: string;
  command: {
    id: string;
    tooltipProps?: TooltipPropsWithTitle;
  };
};
