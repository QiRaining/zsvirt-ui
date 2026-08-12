import { KernelTrafficTypes } from "@zstack/zsphere-types";
import type { HostKernelInterface as IHostKernelInterface } from "@zstack/zsphere-types/graphql";
import { useIntl } from "react-intl";
import { create } from "zustand";

interface IDetailStore {
  detail: IHostKernelInterface;
  setDetail: (value: IHostKernelInterface) => void;
  visible: boolean;
  setVisible: (visible: boolean) => void;
}

export const useDetailStore = create<IDetailStore>((set) => ({
  detail: {} as any,
  setDetail: (detail) => set({ detail }),
  visible: false,
  setVisible: (visible) => set({ visible }),
}));

export const useKernelTrafficTypesMap = () => {
  const intl = useIntl();

  const kernelTrafficTypesMap = new Map<KernelTrafficTypes, string>([
    [
      KernelTrafficTypes.Management,
      intl.formatMessage({
        id: "kernelTrafficTypes.management",
        defaultMessage: "Management",
      }),
    ],
    [
      KernelTrafficTypes.Storage,
      intl.formatMessage({
        id: "kernelTrafficTypes.storage",
        defaultMessage: "Storage",
      }),
    ],
  ]);

  const kernelTrafficTypesList = [...kernelTrafficTypesMap.entries()].map(
    ([key, label]) => ({
      key,
      label,
    }),
  );

  return { kernelTrafficTypesMap, kernelTrafficTypesList };
};

export enum IpAllocationPolicyEnum {
  Auto,
  Manual,
}

export const useIpAllocationPolicyMap = () => {
  const intl = useIntl();

  const ipAllocationPolicyMap = new Map<IpAllocationPolicyEnum, string>([
    [
      IpAllocationPolicyEnum.Auto,
      intl.formatMessage({
        id: "system.auto.allocation",
        defaultMessage: "System allocation",
      }),
    ],
    [
      IpAllocationPolicyEnum.Manual,
      intl.formatMessage({ id: "manual.appoint", defaultMessage: "Manual Specification" }),
    ],
  ]);

  const ipAllocationPolicyMapList = [...ipAllocationPolicyMap.entries()].map(
    ([key, label]) => ({
      key,
      label,
    }),
  );

  return { ipAllocationPolicyMap, ipAllocationPolicyMapList };
};
