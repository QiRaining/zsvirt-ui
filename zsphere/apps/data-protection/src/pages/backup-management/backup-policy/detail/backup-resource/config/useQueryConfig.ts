import { useQueryConfig } from "@zstack/zsphere-engine/src/vm";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    resourceType: "VmInstance",
    needFuzzyQuery: true,
    filteredKeys: ["name", "uuid"],
    defaultQuery,
  });
};
