import { Op } from "@zstack/zsphere-types";
import type { BackupStorage as IBS } from "@zstack/zsphere-types/graphql";
import React from "react";
import AuditList from "zsv_shared/auditing/list";

interface IProps {
  current: Partial<IBS>;
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
