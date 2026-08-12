import type { FC } from "react";
import React from "react";
import AuditList from "zsv_auditing/auditing-sub-list";

export interface IProps {
  uuid: string;
}

const SubAuditList: FC<IProps> = ({ uuid }) => {
  return (
    <AuditList
      view="sub"
      defaultQuery={{
        conditions: [
          {
            key: "resourceUuid",
            value: uuid,
          },
        ],
      }}
    />
  );
};

export default SubAuditList;
