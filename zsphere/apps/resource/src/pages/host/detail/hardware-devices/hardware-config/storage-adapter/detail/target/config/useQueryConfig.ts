import { useQueryConfig } from "@zstack/zsphere-engine/src/iscsi-target";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    needFuzzyQuery: true,
    resourceType: "IscsiTarget",
    defaultQuery,
  });
};
