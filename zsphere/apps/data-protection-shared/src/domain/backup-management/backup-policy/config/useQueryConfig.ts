import { useQueryConfig } from "@zstack/zsphere-engine/src/backup-job";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    resourceType: "SchedulerJobGroup",
    needFuzzyQuery: true,
    defaultQuery,
  });
};
