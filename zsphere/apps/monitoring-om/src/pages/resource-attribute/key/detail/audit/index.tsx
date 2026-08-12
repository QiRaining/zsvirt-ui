import { Op } from "@zstack/zsphere-types";
import type { ResourceAttributeKey } from "@zstack/zsphere-types/graphql";
import React from "react";
import List from "zsv_shared/auditing/list";

export interface IProps {
  current?: ResourceAttributeKey;
}

export default function Audit({ current }: IProps) {
  return (
    <List
      view="sub"
      defaultQuery={{
        conditions: [
          {
            key: "resourceUuid",
            op: Op.eq,
            value: current?.uuid ?? "",
          },
        ],
      }}
    />
  );
}
