import { Text } from "@zstack/design";
import { TableDetailLink } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/pre-config-template";
import { PreconfigurationTemplateState } from "@zstack/zsphere-types";
import type {
  PreconfigurationTemplate as IPreconfigurationTemplate,
  PreconfigurationTemplate,
} from "@zstack/zsphere-types/graphql";
import React from "react";

const textRightMarginStyle: React.CSSProperties = { marginRight: "8px" };

export default () => {
  return useColumnConfig<IPreconfigurationTemplate>([
    {
      key: "name",
      render: (template: PreconfigurationTemplate) => {
        return (
          <>
            <Text style={textRightMarginStyle}>
              <TableDetailLink currentRow={template}>
                {template.name}
              </TableDetailLink>
            </Text>
          </>
        );
      },
    },
    {
      key: "state",
      filterOptions: PreconfigurationTemplateState,
    },
  ]);
};
