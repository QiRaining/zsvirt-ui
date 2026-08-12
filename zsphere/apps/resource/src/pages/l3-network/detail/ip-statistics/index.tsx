import { Op } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import IpStatisticsList from "./list";

interface IProps {
  current: Partial<IL3Network>;
  iL3NetworkType?: string;
  view?: string;
}

const IpStatistics: React.FC<IProps> = ({ current, view }) => {
  const query = useMemo(
    () => ({
      conditions: [
        {
          key: "l3NetworkUuid",
          op: Op.eq,
          value: current.uuid,
        },
      ],
    }),
    [current],
  );

  return (
    <IpStatisticsList
      view={
        view ??
        (current.l2Network?.vSwitchType === "OvsDpdk"
          ? "sub.network.hp"
          : "sub")
      }
      defaultQuery={query}
      source={current as IL3Network}
    />
  );
};

export default IpStatistics;
