import { useQueryConfig } from "@zstack/zsphere-engine/src/resource-attribute-value";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    defaultQuery,
    resourceType: "ResourceAttributeValue",
    needFuzzyQuery: true,
  });
};
