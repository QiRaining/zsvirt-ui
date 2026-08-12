import { Op } from "@zstack/zsphere-types";
import type { Cluster as ICluster } from "@zstack/zsphere-types/graphql";
import React from "react";
import AuditList from "zsv_auditing/auditing-sub-list";

export interface IProps {
  current: ICluster;
}

const ClusterAuditList: React.FC<IProps> = ({ current }) => {
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

  return <AuditList view="sub" defaultQuery={defaultQuery} />;
};

export default ClusterAuditList;
