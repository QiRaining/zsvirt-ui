import { Op } from "@zstack/zsphere-types";
import Audit from "zsv_shared/auditing/list";
export interface IProps {
  current?: any;
}

export default function DetailAudit({ current }: IProps) {
  return (
    <Audit
      view="sub"
      defaultQuery={{
        conditions: [
          {
            key: "resourceUuid",
            op: Op.eq,
            value: current?.uuid,
          },
        ],
      }}
    />
  );
}
