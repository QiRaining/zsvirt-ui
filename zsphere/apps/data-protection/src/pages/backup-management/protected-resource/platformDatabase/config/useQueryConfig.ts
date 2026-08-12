import { useQueryConfig } from "@zstack/zsphere-engine/src/local-backup-data-db";

export default () => {
  return useQueryConfig([], {
    resourceType: "platformDatabaseBackup",
    needFuzzyQuery: true,
  });
};
