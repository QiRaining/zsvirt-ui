"use client";
import React from "react";

import type { IStateProps } from "../state";

export interface IConstantMap {
  constantMap: Map<string, IStateProps>;
  constantGroupMap: Map<string, IStateProps>;
}

export interface ConfigProps {
  constant?: IConstantMap;
}

export const ConfigContext = React.createContext<ConfigProps>({
  constant: {
    constantMap: new Map(),
    constantGroupMap: new Map(),
  },
});

export const ConfigProvider: React.FC<
  ConfigProps & { children: React.ReactNode }
> & {
  ConfigContext: typeof ConfigContext;
} = (props) => {
  const { children, ...config } = props;

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

ConfigProvider.ConfigContext = ConfigContext;
