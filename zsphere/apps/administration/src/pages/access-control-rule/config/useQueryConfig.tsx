import { useQueryConfig as _useQueryConfig } from "@zstack/zsphere-engine/src/access-control-rule";

function useQueryConfig() {
  const config = _useQueryConfig([], {
    resourceType: "AccessControlRule",
    needFuzzyQuery: true,
  });

  return config;
}

export default useQueryConfig;
