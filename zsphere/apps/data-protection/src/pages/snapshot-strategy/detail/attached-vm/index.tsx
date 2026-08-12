import { VmQueryType } from "@zstack/zsphere-types";
import type { SnapshotStrategy } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

import useActionConfig from "./config/useActionConfig";

export interface IProps {
  current?: SnapshotStrategy;
}

export default function AttachedVm({ current }: IProps) {
  const actionConfig = useActionConfig();
  const defaultQuery = useMemo(() => {
    return {
      type: VmQueryType.GetInstanceWithSnapshotStrategy,
      extraConditions: [
        { key: "__schedulerJobGroupUuid__", value: current?.uuid },
      ],
    };
  }, [current]);

  return (
    <VmPlainList
      view="sub.virtualization.snapshot-strategy"
      actionConfig={actionConfig}
      defaultQuery={defaultQuery}
      source={current}
    />
  );
}
