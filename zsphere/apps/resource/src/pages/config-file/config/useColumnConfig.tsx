import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/config-file";
import type { ConfigFile } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

export default () => {
  const intl = useIntl();

  const columnConfig = React.useMemo(
    () => [
      {
        key: "name",
        title: intl.formatMessage({
          id: "primaryStorage.registerVm.configFile.table.name",
          defaultMessage: "Name",
        }),
        width: 200,
        render: (current: ConfigFile) => {
          return <Text>{current.name}</Text>;
        },
      },
      {
        key: "path",
        title: intl.formatMessage({
          id: "primaryStorage.registerVm.configFile.table.path",
          defaultMessage: "Path",
        }),
        render: (current: ConfigFile) => {
          return <Text>{current.path || "-"}</Text>;
        },
      },
    ],
    [intl],
  );

  return useColumnConfig<ConfigFile>(columnConfig);
};
