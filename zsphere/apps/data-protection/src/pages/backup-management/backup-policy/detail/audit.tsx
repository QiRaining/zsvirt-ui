import { Op } from "@zstack/zsphere-types";
import { useMemo } from "react";
import Audit from "zsv_shared/auditing/list";

export interface IProps {
  current?: any;
}

export default function DetailAudit({ current }: IProps) {
  const defaultQuery = useMemo(
    () => ({
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: current?.uuid,
        },
      ],
    }),
    [current?.uuid],
  );

  return <Audit view="sub" defaultQuery={defaultQuery} />;
}
