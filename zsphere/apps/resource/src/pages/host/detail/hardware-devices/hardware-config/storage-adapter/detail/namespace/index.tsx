import { Op } from "@zstack/zsphere-types";
import React, { useMemo } from "react";

import NamespaceList from "./list";

export interface IProps {
  current: any;
}

export default function Namespace({ current }: IProps) {
  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "nvmeLunHostRef.hostUuid",
          op: Op.eq,
          value: current?.hostUuid || "",
        },
        {
          key: "nvmeLunHostRef.transport",
          op: Op.ne,
          value: "PCIE",
        },
      ],
    }),
    [current],
  );

  return <NamespaceList view="main" defaultQuery={defaultQuery} />;
}
