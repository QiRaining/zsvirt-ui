import { useQueryConfig } from "@zstack/zsphere-engine/src/scheduling-task";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "schedulingTask",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig(
    [
      {
        key: "job.object",
        searchKey: "vm",
      },
    ],
    queryProps,
  );
};
