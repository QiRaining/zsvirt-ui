import { Text } from "@zstack/design";
import { TableDetailLink } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vm-spec";
import type { IllustrationTypes } from "@zstack/zsphere-illustration";
import { Illustration } from "@zstack/zsphere-illustration";
import { VmSpecPlatform } from "@zstack/zsphere-types";
import type { VmCustomSpecification } from "@zstack/zsphere-types/graphql";
import React from "react";

import style from "./style.module.less";

export const renderPlatform = (platform: VmSpecPlatform) => {
  return (
    <div className={style.platform}>
      <Illustration
        type={`os.${platform.toLowerCase()}` as IllustrationTypes}
        size={16}
      />
      <Text>{platform}</Text>
    </div>
  );
};

export default (props?: { view?: string }) => {
  return useColumnConfig<VmCustomSpecification>([
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
      key: "platform",
      filters:
        props?.view !== "select"
          ? Object.values(VmSpecPlatform).map((value) => ({
              text: <div className={style.filter}>{renderPlatform(value)}</div>,
              value,
            }))
          : undefined,
      render: (current) => {
        if (!current.platform) {
          return null;
        }
        return renderPlatform(current.platform);
      },
    },
  ]);
};
