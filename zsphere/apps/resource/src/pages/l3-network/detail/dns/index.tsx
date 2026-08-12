import { Op } from "@zstack/zsphere-types";
import type { L3Network as IL3Network } from "@zstack/zsphere-types/graphql";
import React, { useMemo } from "react";

import DnsList from "./list";

interface IProps {
  current: IL3Network;
  iL3NetworkType?: string;
  isShared?: boolean;
}

const Dns: React.FC<IProps> = ({ current, iL3NetworkType, isShared }) => {
  const query = useMemo(
    () => ({
      conditions: [
        {
          key: "uuid",
          op: Op.eq,
          value: current.uuid,
        },
      ],
    }),
    [current],
  );
  return (
    <DnsList
      view={isShared ? "sub.share" : "sub"}
      current={current}
      iL3NetworkType={iL3NetworkType}
      source={current}
      defaultQuery={query}
    />
  );
};

export default Dns;
