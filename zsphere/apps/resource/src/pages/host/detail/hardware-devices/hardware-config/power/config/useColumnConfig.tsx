import { Constant } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/power";
import type { PowerSupply as IPowerSupply } from "@zstack/zsphere-types/graphql";
import React from "react";

export default () => {
  return useColumnConfig<IPowerSupply>([
    {
      key: "state",
      render: ({ state }) => {
        return <Constant value={state} enumType={ConstantType.HardwareState} />;
      },
    },
    {
      key: "ratedPower",
      formatter: ({ ratedPower }) => (ratedPower ? `${ratedPower} w` : ""),
      empty: "notSupport",
    },
    {
      key: "currentPower",
      formatter: ({ currentPower }) =>
        currentPower ? `${currentPower} w` : "",
      empty: "notSupport",
    },
  ]);
};
