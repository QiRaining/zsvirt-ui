import {
  VmSchedulingRuleMode,
  VmSchedulingRuleRule,
} from "@zstack/zsphere-types";
import type { VmSchedulingRule } from "@zstack/zsphere-types/graphql";

export enum VmSchedulingRuleType {
  AntiAffinityVm = "AntiAffinityVm",
  AffinityVm = "AffinityVm",
  VmAffinityHost = "VmAffinityHost",
  VmAntiAffinityHost = "VmAntiAffinityHost",
}

export const translateVmSchedulingRuleTypeOptions = (intl: any) => {
  return [
    {
      label: intl.formatMessage({
        id: "vmSchedulingRuleType.affinityVm",
        defaultMessage: "VM Affinitive to Each Other",
      }),
      value: VmSchedulingRuleType.AffinityVm,
    },
    {
      label: intl.formatMessage({
        id: "vmSchedulingRuleType.antiAffinityVm",
        defaultMessage: "VM Exclusive from Each Other",
      }),
      value: VmSchedulingRuleType.AntiAffinityVm,
    },
    {
      label: intl.formatMessage({
        id: "vmSchedulingRuleType.vmAffinityHost",
        defaultMessage: "VMs Affinitive to Hosts",
      }),
      value: VmSchedulingRuleType.VmAffinityHost,
    },
    {
      label: intl.formatMessage({
        id: "vmSchedulingRuleType.vmAntiAffinityHost",
        defaultMessage: "VMs Exclusive from Hosts",
      }),
      value: VmSchedulingRuleType.VmAntiAffinityHost,
    },
  ];
};

export const renderVmSchedulingRuleMode = (
  intl: any,
  mode: VmSchedulingRuleMode,
) => {
  const map = {
    [VmSchedulingRuleMode.HARD]: intl.formatMessage({
      id: "vmSchedulingRuleMode.force",
      defaultMessage: "Hard",
    }),
    [VmSchedulingRuleMode.SOFT]: intl.formatMessage({
      id: "vmSchedulingRuleMode.priority",
      defaultMessage: "Soft",
    }),
  };
  return map[mode] || mode;
};

export const renderVmSchedulingRuleType = (
  intl: any,
  vmSchedulingRule: VmSchedulingRule,
) => {
  const { rule, hostGroup } = vmSchedulingRule;
  const typeOptions = translateVmSchedulingRuleTypeOptions(intl);
  if (rule === VmSchedulingRuleRule.AFFINITY) {
    if (hostGroup) {
      return typeOptions?.find(
        (it) => it.value === VmSchedulingRuleType.VmAffinityHost,
      )?.label;
    }
    return typeOptions?.find(
      (it) => it.value === VmSchedulingRuleType.AffinityVm,
    )?.label;
  }
  if (rule === VmSchedulingRuleRule.ANTIAFFINITY) {
    if (hostGroup) {
      return typeOptions?.find(
        (it) => it.value === VmSchedulingRuleType.VmAntiAffinityHost,
      )?.label;
    }
    return typeOptions?.find(
      (it) => it.value === VmSchedulingRuleType.AntiAffinityVm,
    )?.label;
  }
};
