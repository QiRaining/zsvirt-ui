import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";
import React from "react";
export interface LogServerContext {
  store: LogServerStore;
  setStore: (v: LogServerStore) => void;
}

interface LogServerStore {
  logServer?: ILogServer;
}

export const LogServerContext = React.createContext<LogServerContext>({
  store: {},
  setStore: () => {},
});
