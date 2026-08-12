import { Text } from "@zstack/design";
import { TableDetailLink } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/resource-attribute-constraint";
import type { ResourceAttributeConstraint } from "@zstack/zsphere-types/graphql";
import React from "react";

export default () => {
  return useColumnConfig<ResourceAttributeConstraint>([
    {
      key: "parameter",
      render: (current: ResourceAttributeConstraint) => {
        return (
          <Text>
            <TableDetailLink currentRow={current}>
              {current.parameter}
            </TableDetailLink>
          </Text>
        );
      },
    },
  ]);
};
