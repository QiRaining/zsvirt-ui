import { useQueryConfig } from "@zstack/zsphere-engine/src/resource-attribute-key";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    defaultQuery,
    resourceType: "ResourceAttributeKey",
    needFuzzyQuery: true,
  });
};
