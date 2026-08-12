import { InfoPopover } from "@zstack/design";
import { Constant, ResourceName } from "@zstack/zsphere-components";
import { useAuth } from "@zstack/zsphere-components";
import { ConstantType } from "@zstack/zsphere-constant";
import { useColumnConfig } from "@zstack/zsphere-engine/src/vm-scheduling-rule";
import type { IOption } from "@zstack/zsphere-engine/src/vm-scheduling-rule/useColumnConfig";
import { VmSchedulingRuleState } from "@zstack/zsphere-types";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";
import { useContext, useMemo } from "react";
import { useIntl } from "react-intl";
import ReactMarkdown from "react-markdown";
import { ZoneUuidContext } from "zsv_reliability_shared/vm-scheduling-rule/context";
import { renderVmSchedulingRuleType } from "zsv_reliability_shared/vm-scheduling-rule/vm-group/utils";

import { VmSchedulingRuleType } from "../../vm-scheduling-rule/create/types";

export enum VmSchedulingExcuteState {
  Normal = "Normal",
  Conflict = "Conflict",
  Invalid = "Invalid",
}

export const vmAffinityHostAuth = {
  type: "block" as const,
  resource: "vm.scheduling.rule",
  authKey: "vmAffinityHost",
};

export const vmAntiAffinityHostAuth = {
  type: "block" as const,
  resource: "vm.scheduling.rule",
  authKey: "vmAntiAffinityHost",
};

interface AuthMap {
  [key: string]: any;
}

export const typeAuthMap: AuthMap = {
  VmAffinityHost: vmAffinityHostAuth,
  VmAntiAffinityHost: vmAntiAffinityHostAuth,
};

export default () => {
  const intl = useIntl();
  const { hasAuth } = useAuth();
  const { zoneUuid } = useContext(ZoneUuidContext);

  const typeFilterOptions = useMemo(() => {
    const result: any = {};
    Object.keys(VmSchedulingRuleType).forEach((key) => {
      const value =
        VmSchedulingRuleType[key as keyof typeof VmSchedulingRuleType];
      if (
        [
          VmSchedulingRuleType.VmAffinityHost,
          VmSchedulingRuleType.VmAntiAffinityHost,
        ].includes(value)
      ) {
        if (hasAuth(typeAuthMap[value])) {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    });
    return result;
  }, []);

  const options: IOption<VmSchedulingRule> = [
    {
      key: "name",
      linkResource: {
        microAppName: "virtualization-reliability",
        path: "vm-scheduling-rule",
      },
      render: (current: VmSchedulingRule) =>
        zoneUuid ? (
          <ResourceName
            value={current?.name}
            link={{
              to: `/vm-scheduling-rule`,
              microAppName: "virtualization-reliability",
              uuid: current?.uuid,
              zoneUuid,
            }}
          />
        ) : (
          current?.name
        ),
    },
    {
      key: "type",
      filterOptions: typeFilterOptions,
      formatter: (value: VmSchedulingRule) =>
        renderVmSchedulingRuleType(intl, value),
    },
    {
      key: "state",
      filterOptions: VmSchedulingRuleState,
    },
    {
      key: "excuteState",
      title: () => {
        return (
          <span className="inline-flex items-center gap-1">
            {intl.formatMessage({
              id: "excuteState",
              defaultMessage: "Execution Status",
            })}
            <InfoPopover
              side="top"
              content={
                <ReactMarkdown>
                  {intl.formatMessage({
                    id: "vmSchedulingRule.field.excuteState.tooltip",
                    defaultMessage: "",
                  })}
                </ReactMarkdown>
              }
            />
          </span>
        );
      },
      filterEnumType: ConstantType.VmSchedulingExcuteState,
      filterOptions: VmSchedulingExcuteState,
      render: ({ excuteState }) => {
        return (
          <Constant
            value={excuteState}
            enumType={ConstantType.VmSchedulingExcuteState}
          />
        );
      },
    },
  ];

  return useColumnConfig(options);
};
