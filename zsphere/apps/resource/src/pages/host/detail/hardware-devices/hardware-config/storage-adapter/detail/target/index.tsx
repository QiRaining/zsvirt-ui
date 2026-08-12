import { Op } from "@zstack/zsphere-types";
import React, { useMemo } from "react";

import IscsiTargetList from "./list";

export interface IProps {
  current: any;
}

export default function Target({ current }: IProps) {
  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "iscsiLun.scsiLunHostRef.hostUuid",
          op: Op.eq,
          value: current?.hostUuid || "",
        },
      ],
    }),
    [current],
  );

  return (
    <IscsiTargetList view="sub.storage.adapter" defaultQuery={defaultQuery} />
  );
}
