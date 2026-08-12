import { useQueryConfig } from "../../../../../../shared/engine/src/snapshot-strategy";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    resourceType: "SchedulerJobGroup",
    needFuzzyQuery: true,
    defaultQuery,
  });
};
