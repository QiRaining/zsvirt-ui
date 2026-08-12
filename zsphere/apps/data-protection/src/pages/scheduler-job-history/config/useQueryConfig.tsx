import { useQueryConfig } from "@zstack/zsphere-engine/src/scheduler-job-history";

export default (defaultQuery?: any) => {
  return useQueryConfig([], {
    defaultQuery,
    needFuzzyQuery: true,
  });
};
