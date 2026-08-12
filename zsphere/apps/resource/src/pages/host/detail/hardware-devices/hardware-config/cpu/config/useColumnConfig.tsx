import { useColumnConfig } from "@zstack/zsphere-engine/src/cpu";
import type { HostPhysicalCpu } from "@zstack/zsphere-types/graphql";

export default () => {
  return useColumnConfig<HostPhysicalCpu>([]);
};
