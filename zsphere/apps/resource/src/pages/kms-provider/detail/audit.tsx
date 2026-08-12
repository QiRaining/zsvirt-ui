import { Op } from "@zstack/zsphere-types";
import { useMemo } from "react";
import AuditList from "zsv_auditing/auditing-sub-list";

export interface IProps {
  current: any;
}

export default function AuditSubList({ current }: IProps) {
  const defaultQuery = useMemo(() => {
    return {
      conditions: [
        {
          key: "resourceUuid",
          op: Op.eq,
          value: current?.uuid ?? "",
        },
      ],
    };
  }, [current?.uuid]);

  return <AuditList view="sub" defaultQuery={defaultQuery} />;
}
