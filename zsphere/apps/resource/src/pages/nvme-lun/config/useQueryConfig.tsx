import { useQueryConfig as _useQueryConfig } from "@zstack/zsphere-engine/src/nvme-lun";

function useQueryConfig() {
  const config = _useQueryConfig([], {
    resourceType: "NVMeLun",
    needFuzzyQuery: true,
  });

  return config;
}

export default useQueryConfig;
