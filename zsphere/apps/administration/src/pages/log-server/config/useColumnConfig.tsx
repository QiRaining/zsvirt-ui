import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/log-server";
import type { LogServer as ILogServer } from "@zstack/zsphere-types/graphql";
import React, { useCallback } from "react";
import { useIntl } from "react-intl";

import { LogServerContext } from "../hook";

import style from "../style.module.less";

const LogServerNameCell: React.FC<{
  logServer: ILogServer;
  onSelect: (logServer: ILogServer) => void;
}> = ({ logServer, onSelect }) => {
  const handleClick = useCallback(() => {
    onSelect(logServer);
  }, [logServer, onSelect]);

  return (
    <Text className={style["cloumn-name"]} onClick={handleClick}>
      <span>{logServer?.name}</span>
    </Text>
  );
};

export default () => {
  const intl = useIntl();
  const { store, setStore } = React.useContext(LogServerContext);
  const handleSelectLogServer = useCallback(
    (logServer: ILogServer) => {
      setStore({
        ...store,
        logServer,
      });
    },
    [setStore, store],
  );
  return useColumnConfig<ILogServer>([
    {
      key: "name",
      render: (it: ILogServer) => {
        return (
          <LogServerNameCell logServer={it} onSelect={handleSelectLogServer} />
        );
      },
    },
    {
      key: "hostname",
      title: intl.formatMessage({
        id: "address",
        defaultMessage: "Address",
      }),
    },
    {
      key: "port",
    },
    {
      key: "logType",
      formatter: (it: ILogServer) => {
        if (it.logType === "platform") {
          return intl.formatMessage({
            id: "logServer.logType.platform",
            defaultMessage: "Platform Operation Log",
          });
        }

        if (it.logType === "management") {
          return intl.formatMessage({
            id: "logServer.logType.management",
            defaultMessage: "Management Node Log",
          });
        }

        return it.logType;
      },
    },
    {
      key: "createDate",
    },
  ]);
};
