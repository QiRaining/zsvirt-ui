import { Op, VmQueryType } from "@zstack/zsphere-types";
import type { SchedulerJobGroup } from "@zstack/zsphere-types/graphql";
import { useMemo } from "react";
import { VmPlainList } from "zsv_resource_shared/vm/mf-index";

import useActionConfig from "./config/useActionConfig";
import useQueryConfig from "./config/useQueryConfig";

export interface IProps {
  current?: SchedulerJobGroup;
}

export default function AttachedVm({ current }: IProps) {
  const defaultQuery = useMemo(() => {
    return {
      type: VmQueryType.GetVmBySchedulerJobGroup,
      extraConditions: [
        {
          key: "schedulerJobGroupUuids",
          op: Op.in,
          values: current?.uuid ? [current.uuid] : [],
        },
      ],
    };
  }, [current?.uuid]);

  const queryConfig = useQueryConfig(defaultQuery);
  const actionConfig = useActionConfig();

  return (
    <VmPlainList
      view="sub.virtualization.backup.policy"
      defaultQuery={defaultQuery}
      source={current}
      actionConfig={actionConfig}
      queryConfig={queryConfig}
    />
  );
}
