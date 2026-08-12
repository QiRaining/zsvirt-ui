import { ETabType } from "@zstack/virtualization-resource/src/pages/cluster/constant";
import ClusterList from "@zstack/virtualization-resource/src/pages/cluster/list";
import { ClusterQueryType, Op } from "@zstack/zsphere-types";
import type { IscsiServer as IIscsiServer } from "@zstack/zsphere-types/graphql";
import React from "react";

interface IProps {
  current: IIscsiServer;
}

const Config: React.FC<IProps> = ({ current }) => {
  return (
    <div>
      <ClusterList
        source={{ current, type: ETabType.NORMAL }}
        view="sub.virtualization.iscsi.server"
        defaultQuery={{
          type: ClusterQueryType.GetClusterByISCSIServer,
          conditions: [
            {
              key: "hypervisorType",
              op: Op.eq,
              value: "KVM",
            },
          ],
          extraConditions: [
            {
              key: "iscsiServerUuid",
              op: Op.eq,
              value: current.uuid,
            },
          ],
        }}
      />
    </div>
  );
};

export default Config;
