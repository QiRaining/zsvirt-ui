import { useQueryConfig } from "@zstack/zsphere-engine/src/zsv-backup-storage";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    resourceType: "ZSVBackupStorage",
    needFuzzyQuery: true,
    defaultQuery,
  });
};
