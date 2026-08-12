import { useQueryConfig } from "@zstack/zsphere-engine/src/nvme-namespace";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    needFuzzyQuery: true,
    resourceType: "NVMeLun",
    defaultQuery,
  });
};
