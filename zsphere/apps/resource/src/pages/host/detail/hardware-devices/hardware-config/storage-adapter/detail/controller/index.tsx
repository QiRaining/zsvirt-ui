import { Op } from "@zstack/zsphere-types";
import React, { useMemo } from "react";

import ControllerList from "./list";

export interface IProps {
  current: any;
}

export default function Controller({ current }: IProps) {
  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "nvmeLun.nvmeLunHostRef.hostUuid",
          op: Op.eq,
          value: current?.hostUuid || "",
        },
        {
          key: "nvmeLun.nvmeLunHostRef.transport",
          op: Op.ne,
          value: "PCIE",
        },
      ],
    }),
    [current],
  );

  return (
    <ControllerList view="sub.storage.adapter" defaultQuery={defaultQuery} />
  );
}
