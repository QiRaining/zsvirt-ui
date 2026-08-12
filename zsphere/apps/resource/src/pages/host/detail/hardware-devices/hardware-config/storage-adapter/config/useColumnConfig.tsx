import { Text } from "@zstack/design";
import { TableDetailLink } from "@zstack/zsphere-components";
import { ConstantType, ConstantEnum } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/storage-adapter";
import { pick } from "lodash-es";
import React from "react";

import { formatType, renderIdentifier, renderState } from "../util";

export default () => {
  return useColumnConfig([
    {
      key: "name",
      render: (current) => {
        return (
          <Text>
            <TableDetailLink currentRow={current}>
              {current.name}
            </TableDetailLink>
          </Text>
        );
      },
    },
    {
      key: "speed",
      formatter: (current) => current.speed || "-",
    },
    {
      key: "state",
      filterEnumType: ConstantType.HardwareState,
      filterOptions: pick(ConstantEnum, [
        ConstantEnum.Normal,
        ConstantEnum.Abnormal,
      ]),
      render: (current) => renderState(current),
    },
    {
      key: "type",
      filters: [
        { text: "iSCSI", value: "iSCSI" },
        { text: "FC", value: "FC" },
        { text: "NVMe over Fabrics", value: "NVMe" },
      ],
      render: (current) => {
        const type = formatType(current);
        if (!type) {
          return null;
        }
        return <Text>{type}</Text>;
      },
    },
    {
      key: "identifier",
      render: (current) => renderIdentifier(current),
    },
    {
      key: "model",
      formatter: (current) =>
        current.type === "FC" ? current.model?.split(" ")[0] : current.model,
    },
  ]);
};
