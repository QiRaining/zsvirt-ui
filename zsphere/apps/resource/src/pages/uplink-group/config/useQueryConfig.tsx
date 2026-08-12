import { useQueryConfig } from "@zstack/zsphere-engine/src/uplink-group";
import type { IQuery } from "@zstack/zsphere-types";

export default ({ defaultQuery }: { defaultQuery?: IQuery } = {}) => {
  return useQueryConfig([], {
    defaultQuery: defaultQuery as any,
    needFuzzyQuery: true,
    resourceType: "HostKernelInterface",
  });
};
