import { Constant } from "@zstack/zsphere-components";
import { ConstantEnum, ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/memory";
import type { Memory as IMemory } from "@zstack/zsphere-types/graphql";
import React from "react";
import { useIntl } from "react-intl";

import style from "./style.module.less";

export default () => {
  const intl = useIntl();
  return useColumnConfig<IMemory>([
    {
      key: "slotNumber",
      sortKey: "locator",
      formatter: ({ locator }) => locator,
    },
    {
      key: "size",
      render: ({ size }) =>
        size || (
          <div className={style.unidentified}>
            {intl.formatMessage({
              id: "unidentified",
              defaultMessage: "Unknown",
            })}
          </div>
        ),
    },
    {
      key: "state",
      formatter: ({ state }: any) => {
        return (
          <Constant
            value={ConstantEnum[state as any as ConstantEnum.Normal]}
            enumType={ConstantType.HardwareState}
          />
        );
      },
    },
    {
      key: "clockSpeed",
      formatter: ({ clockSpeed }) =>
        clockSpeed === "Unknown" ? "" : clockSpeed,
      empty: "notSupport",
    },
    {
      key: "speed",
      formatter: ({ speed }) => (speed === "Unknown" ? "" : speed),
      empty: "notSupport",
    },
  ]);
};
