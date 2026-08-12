import { useQueryConfig } from "@zstack/zsphere-engine/src/storage-adapter";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    needFuzzyQuery: true,
    resourceType: "StorageAdapter",
    defaultQuery,
  });
};
