import type { Item } from "@zstack/zsphere-types";
import { Op } from "@zstack/zsphere-types";
import { useMemo } from "react";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

export interface IProps {
  current: Item;
}

export default function RelatedResource({ current }: IProps) {
  const defaultQuery = useMemo(() => {
    return {
      type: "GetKeyProviderRelatedResource",
      conditions: [
        {
          key: "state",
          op: Op.ne,
          value: "Destroyed",
        },
      ],
      extraConditions: [
        {
          key: "providerUuid",
          op: Op.eq,
          value: current?.uuid || "",
        },
      ],
    };
  }, [current?.uuid]);

  return <VmPlainList view="sub.kms" defaultQuery={defaultQuery} />;
}
