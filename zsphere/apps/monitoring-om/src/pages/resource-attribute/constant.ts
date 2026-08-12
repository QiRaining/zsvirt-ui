import type { useAuth } from "@zstack/zsphere-components";

export type ResourceType =
  | string
  | {
      value: string;
      auth: Parameters<ReturnType<typeof useAuth>["hasAuth"]>[0];
    };

export const supportedResourceTypes: Array<ResourceType> = [
  "VmInstanceVO",
  "HostVO",
  "PrimaryStorageVO",
  "L2NetworkVO",
  "L3NetworkVO",
  {
    value: "BaremetalInstanceVO",
    auth: {
      type: "block",
      authKey: "resource.type.baremetal.instance",
      resource: "resource.attribute",
    },
  },
];
