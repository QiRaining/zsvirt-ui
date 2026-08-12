import { ResourceName } from "@zstack/zsphere-components";
import { Tag } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vm-group";
import type { IOption } from "@zstack/zsphere-engine/src/vm-group/useColumnConfig";
import type { VmGroup, VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import { uniq as _uniq } from "lodash-es";
import { useIntl } from "react-intl";

import { renderVmSchedulingRuleType } from "../utils";

interface IProps {
  view?: string;
  zoneUuid?: string;
}

export default (props?: IProps) => {
  const intl = useIntl();

  const options: IOption<VmGroup> = [
    {
      key: "name",
      linkResource: {
        microAppName: "virtualization-reliability",
        path: "vm-scheduling-rule/vm-group",
      },
      render: (current: VmGroup) =>
        props?.view?.includes("select") ? (
          current?.name
        ) : (
          <ResourceName
            value={current?.name}
            link={{
              to: `/vm-scheduling-rule/vm-group`,
              microAppName: "virtualization-reliability",
              uuid: current?.uuid,
              zoneUuid: props?.zoneUuid,
            }}
          />
        ),
    },
    {
      key: "vmSchedulingRuleType",
      render: ({ associatedVmSchedulingRuleList }: VmGroup) => {
        const types = associatedVmSchedulingRuleList?.map(
          (vmSchedulingRule: VmSchedulingRule) =>
            renderVmSchedulingRuleType(intl, vmSchedulingRule),
        );
        return types?.length
          ? _uniq(types)?.map((it: any) => {
              return <Tag key={it}>{it}</Tag>;
            })
          : "-";
      },
    },
  ];
  return useColumnConfig(options);
};
