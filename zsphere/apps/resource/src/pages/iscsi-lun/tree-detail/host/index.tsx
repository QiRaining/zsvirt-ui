import HostList from "@zstack/virtualization-resource/src/pages/host/list";
import type { IQuery } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import type { IscsiLun as IIscsiLun } from "@zstack/zsphere-types/graphql";
import { compact, map } from "lodash-es";
import React, { useMemo } from "react";

interface IProps {
  current: Partial<IIscsiLun>;
}

const LunHostList: React.FC<IProps> = ({ current }) => {
  const hostDefaultQuery = useMemo<IQuery>(() => {
    const conditions: IQuery["conditions"] = [
      {
        key: "uuid",
        op: Op.in,
        values: compact(
          map(current?.scsiLunHostRefs || [], (it) => it?.hostUuid),
        ),
      },
    ];

    return {
      conditions,
    };
  }, [current?.scsiLunHostRefs]);

  return (
    <HostList
      view="sub.virtualization.iscsi.lun"
      source={current}
      defaultQuery={hostDefaultQuery}
    />
  );
};

export default LunHostList;
