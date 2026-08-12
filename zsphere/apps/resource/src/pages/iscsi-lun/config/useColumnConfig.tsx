import { Text } from "@zstack/design";
import { useColumnConfig } from "@zstack/zsphere-engine/src/iscsi-lun";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";
import { formatStorage } from "@zstack/zsphere-utils";
import React from "react";

export default () => {
  return useColumnConfig<IIscsiLun>([
    {
      key: "name",
      render: ({ name }) => {
        return <Text>{name}</Text>;
      },
    },
    {
      key: "size",
      formatter: ({ size = 0 }) => formatStorage(size, 2),
    },
  ]);
};
