import React from "react";

import { buildOption } from "./build";
export declare function renderColumnOption(
  option: ReturnType<typeof buildOption>,
  intl: any,
  {
    options,
    getServerTime,
  }: {
    options: any[];
    getServerTime: any;
  },
): {
  list: {
    title: any;
    key: string;
    width: number;
    sorter: boolean;
    filters: false | never[];
    render:
      | ((value: any) => React.ReactNode)
      | ((value: any) => import("react/jsx-runtime").JSX.Element);
  }[];
  viewMap: any;
};
export declare function genColumnFromRemote(
  resourceKey: string,
  intl: any,
  {
    options: extraOptions,
    getServerTime,
  }: {
    options: any[];
    getServerTime: any;
  },
): Promise<{
  list: {
    title: any;
    key: string;
    width: number;
    sorter: boolean;
    filters: false | never[];
    render:
      | ((value: any) => React.ReactNode)
      | ((value: any) => import("react/jsx-runtime").JSX.Element);
  }[];
  viewMap: any;
}>;
