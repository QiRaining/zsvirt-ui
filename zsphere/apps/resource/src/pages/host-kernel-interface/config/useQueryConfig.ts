import { useQueryConfig } from "@zstack/zsphere-engine/src/host-kernel-interface";
import type { IQuery } from "@zstack/zsphere-types";

export default ({ defaultQuery }: { defaultQuery?: IQuery } = {}) => {
  return useQueryConfig([{ key: "ipAddress", searchKey: "usedIps.ip" }], {
    defaultQuery: defaultQuery as any,
    needFuzzyQuery: true,
    resourceType: "HostKernelInterface",
  });
};
