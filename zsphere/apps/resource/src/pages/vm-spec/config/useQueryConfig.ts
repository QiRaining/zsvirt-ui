import { useQueryConfig } from "@zstack/zsphere-engine/src/vm-spec";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    defaultQuery,
    needFuzzyQuery: true,
    resourceType: "VmCustomSpecification",
  });
};
