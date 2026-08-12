import { create } from "zustand";
import { persist } from "zustand/middleware";

export const resourceTreeArrangeKeys = ["createDate", "name"] as const;
export const resourceTreeOrderDirections = ["asc", "desc"] as const;

type ResourceTreeArrangeKey = (typeof resourceTreeArrangeKeys)[number];
type ResourceTreeOrderDirection = (typeof resourceTreeOrderDirections)[number];
type ResourceTreeSettingsInput = Partial<
  Record<keyof ResourceTreeSettingsFormValues, unknown>
>;

export interface ResourceTreeSettingsFormValues {
  arrangeKey: ResourceTreeArrangeKey;
  orderDirection: ResourceTreeOrderDirection;
}

export interface ResourceTreeQueryVariables {
  orderBy: ResourceTreeArrangeKey;
  orderDirection: ResourceTreeOrderDirection;
}

export const resourceTreeSettingsDefaultValues: ResourceTreeSettingsFormValues =
  {
    arrangeKey: "name",
    orderDirection: "asc",
  };

const isResourceTreeArrangeKey = (
  value: unknown,
): value is ResourceTreeArrangeKey =>
  typeof value === "string" &&
  (resourceTreeArrangeKeys as readonly string[]).includes(value);

const isResourceTreeOrderDirection = (
  value: unknown,
): value is ResourceTreeOrderDirection =>
  typeof value === "string" &&
  (resourceTreeOrderDirections as readonly string[]).includes(value);

const normalizeResourceTreeSettings = (
  settings?: ResourceTreeSettingsInput | null,
): ResourceTreeSettingsFormValues => ({
  arrangeKey: isResourceTreeArrangeKey(settings?.arrangeKey)
    ? settings.arrangeKey
    : resourceTreeSettingsDefaultValues.arrangeKey,
  orderDirection: isResourceTreeOrderDirection(settings?.orderDirection)
    ? settings.orderDirection
    : resourceTreeSettingsDefaultValues.orderDirection,
});

export const toResourceTreeQueryVariables = (
  settings?: ResourceTreeSettingsInput | null,
): ResourceTreeQueryVariables => {
  const { arrangeKey, orderDirection } =
    normalizeResourceTreeSettings(settings);

  return {
    orderBy: arrangeKey,
    orderDirection,
  };
};

interface IVirtualizationResourceStore {
  currentResource: {
    uuid: string;
    name: string;
    iconType?: string;
  };
  setCurrentResource: (resource: { uuid: string; name: string }) => void;
  cachedVms: any[];
  setCachedVms: (vms: any[]) => void;
  cachedHosts: any[];
  setCachedHosts: (hosts: any[]) => void;
  cachedClusters: any[];
  setCachedClusters: (clusters: any[]) => void;
  cachedZones: any[];
  setCachedZones: (zones: any[]) => void;
  cachedDirectories: any[];
  setCachedDirectories: (directories: any[]) => void;
  cachedBackupStorages: any[];
  setCachedBackupStorages: (backupStorages: any[]) => void;
  cachedImages: any[];
  setCachedImages: (images: any[]) => void;
  cachedPrimaryStorages: any[];
  setCachedPrimaryStorages: (primaryStorages: any[]) => void;
  cachedL2Networks: any[];
  setCachedL2Networks: (l2Networks: any[]) => void;
  cachedL3Networks: any[];
  setCachedL3Networks: (l3Networks: any[]) => void;
  cachedVMTemplate: any[];
  setCachedVMTemplate: (vMTemplate: any[]) => void;
  resourceTreeSettings: ResourceTreeSettingsFormValues;
  setResourceTreeSettings: (settings: ResourceTreeSettingsFormValues) => void;
}

export const useVirtualizationResourceStore =
  create<IVirtualizationResourceStore>()(
    persist(
      (set) => ({
        currentResource: {
          uuid: "",
          name: "",
        },
        setCurrentResource: (currentResource: { uuid: string; name: string }) =>
          set({ currentResource }),
        cachedVms: [],
        setCachedVms: (cachedVms: any[]) => set({ cachedVms }),
        cachedHosts: [],
        setCachedHosts: (cachedHosts: any[]) => set({ cachedHosts }),
        cachedClusters: [],
        setCachedClusters: (cachedClusters: any[]) => set({ cachedClusters }),
        cachedZones: [],
        setCachedZones: (cachedZones: any[]) => set({ cachedZones }),
        cachedDirectories: [],
        setCachedDirectories: (cachedDirectories: any[]) =>
          set({ cachedDirectories }),
        cachedBackupStorages: [],
        setCachedBackupStorages: (cachedBackupStorages: any[]) =>
          set({ cachedBackupStorages }),
        cachedImages: [],
        setCachedImages: (cachedImages: any[]) => set({ cachedImages }),
        cachedPrimaryStorages: [],
        setCachedPrimaryStorages: (cachedPrimaryStorages: any[]) =>
          set({ cachedPrimaryStorages }),
        cachedL2Networks: [],
        setCachedL2Networks: (cachedL2Networks: any[]) =>
          set({ cachedL2Networks }),
        cachedL3Networks: [],
        setCachedL3Networks: (cachedL3Networks: any[]) =>
          set({ cachedL3Networks }),
        cachedVMTemplate: [],
        setCachedVMTemplate: (cachedVMTemplate: any[]) =>
          set({ cachedVMTemplate }),
        resourceTreeSettings: resourceTreeSettingsDefaultValues,
        setResourceTreeSettings: (
          resourceTreeSettings: ResourceTreeSettingsFormValues,
        ) =>
          set({
            resourceTreeSettings:
              normalizeResourceTreeSettings(resourceTreeSettings),
          }),
      }),
      {
        name: "virtualization-resource-store",
        merge: (persistedState, currentState) => {
          const persisted =
            persistedState && typeof persistedState === "object"
              ? (persistedState as Partial<IVirtualizationResourceStore>)
              : undefined;

          return {
            ...currentState,
            ...persisted,
            resourceTreeSettings: normalizeResourceTreeSettings(
              persisted?.resourceTreeSettings,
            ),
          };
        },
      },
    ),
  );
