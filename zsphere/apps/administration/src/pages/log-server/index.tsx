import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";
import React from "react";

import Detail from "./detail";
import Header from "./header";
import { LogServerContext } from "./hook";
import List from "./list";

import style from "./style.module.less";

const LogServer: React.FC = () => {
  const [store, setStore] = React.useState<LogServerContext["store"]>({});

  const getRowClassName = React.useCallback(
    (record: ILogServer) => {
      return record.uuid === store?.logServer?.uuid ? "active-row" : "";
    },
    [store?.logServer],
  );
  const contextValue = React.useMemo(
    () => ({
      store,
      setStore,
    }),
    [store],
  );

  return (
    <LogServerContext.Provider value={contextValue}>
      <div className="main-list-header-tabs-container">
        <Header />
        <div className={style.body}>
          <div className={style["body-container"]} id="log-server-body">
            <div className={style.main}>
              <List
                view="main.virtualization"
                tableProps={{
                  rowClassName: getRowClassName,
                }}
              />
            </div>
            {store?.logServer?.uuid ? <Detail /> : null}
          </div>
        </div>
      </div>
    </LogServerContext.Provider>
  );
};

export default LogServer;
