import { Op } from "@zstack/zsphere-types";
import type { AccountVO as IAccount } from "@zstack/zsphere-types/graphql";
import React from "react";
import AuditList from "zsv_auditing/auditing-sub-list";

interface IProps {
  current: Partial<IAccount>;
}

const Audit: React.FC<IProps> = ({ current }) => {
  return (
    <AuditList
      view="sub"
      defaultQuery={{
        conditions: [
          {
            key: "resourceUuid",
            op: Op.eq,
            value: current.uuid,
          },
        ],
      }}
    />
  );
};

export default Audit;
