import { Op } from "@zstack/zsphere-types";
import type { Tag as ITag } from "@zstack/zsphere-types/graphql";
import React from "react";
import Audit from "zsv_shared/auditing/list";

export interface IProps {
  current: ITag;
}

const AuditList: React.FC<IProps> = ({ current }) => {
  const defaultQuery = React.useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: current.uuid,
        },
      ],
    }),
    [current.uuid],
  );

  return <Audit view="sub" defaultQuery={defaultQuery} />;
};

export default AuditList;
