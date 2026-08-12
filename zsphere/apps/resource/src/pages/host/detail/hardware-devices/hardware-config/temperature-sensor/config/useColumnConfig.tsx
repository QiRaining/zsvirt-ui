import { Text } from "@zstack/design";
import { TableDetailLink } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/temperature-sensor";
import type { Sensor } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import { formatValue, renderStatus } from "../utils";

export default () => {
  const intl = useIntl();
  return useColumnConfig<Sensor>([
    {
      key: "value",
      formatter: (current) => formatValue(intl, current),
    },
    {
      key: "status",
      render: (current) => renderStatus(current),
    },
    {
      key: "name",
      render: (record) => {
        return (
          <Text>
            <TableDetailLink currentRow={record}>{record.name}</TableDetailLink>
          </Text>
        );
      },
    },
  ]);
};
