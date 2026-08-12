import { useQueryConfig } from "@zstack/zsphere-engine/src/nvme-controller";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    needFuzzyQuery: true,
    resourceType: "NvmeTarget",
    defaultQuery,
  });
};
