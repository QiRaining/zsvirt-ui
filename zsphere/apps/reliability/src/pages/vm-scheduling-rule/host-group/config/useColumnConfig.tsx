import { ResourceName } from "@zstack/zsphere-components";
import { Tag } from "@zstack/zsphere-components";
import { useColumnConfig } from "@zstack/zsphere-engine/src/host-group";
import type { IOption } from "@zstack/zsphere-engine/src/host-group/useColumnConfig";
import type {
  HostGroup,
  VmSchedulingRule,
} from "@zstack/zsphere-types/graphql";
import { uniq as _uniq } from "lodash-es";
import { useIntl } from "react-intl";
import { renderVmSchedulingRuleType } from "zsv_reliability_shared/vm-scheduling-rule/vm-group/utils";

interface IProps {
  view?: string;
  zoneUuid?: string;
}
export default (props?: IProps) => {
  const intl = useIntl();

  const options: IOption<HostGroup> = [
    {
      key: "name",
      linkResource: {
        microAppName: "virtualization-reliability",
        path: "vm-scheduling-rule/host-group",
      },
      render: (current: HostGroup) =>
        props?.view?.includes("select") ? (
          current?.name
        ) : (
          <ResourceName
            value={current?.name}
            link={{
              to: `/vm-scheduling-rule/host-group`,
              microAppName: "virtualization-reliability",
              uuid: current?.uuid,
              zoneUuid: props?.zoneUuid,
            }}
          />
        ),
    },
    {
      key: "vmSchedulingRuleType",
      render: ({ associatedVmSchedulingRuleList }: HostGroup) => {
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

  return useColumnConfig<HostGroup>(options);
};
