import type { HostKernelInterface } from "@zstack/zsphere-types/graphql";

export function validateDeletion(current: HostKernelInterface) {
  return !current.isDefault;
}
