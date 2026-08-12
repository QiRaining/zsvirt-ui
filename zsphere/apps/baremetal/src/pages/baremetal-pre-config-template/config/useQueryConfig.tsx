import { useQueryConfig } from "@zstack/zsphere-engine/src/pre-config-template";

export default () => {
  return useQueryConfig([], {
    resourceType: "PreconfigurationTemplate",
    needFuzzyQuery: true,
  });
};
