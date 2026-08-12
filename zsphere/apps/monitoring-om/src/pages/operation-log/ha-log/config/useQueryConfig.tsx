import { useQueryConfig } from "@zstack/zsphere-engine/src/migrate-log";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "SchedHistoryLog",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig(
    [
      {
        key: "targetHost",
        searchKey: "destHost",
      },
      {
        key: "vmName",
        searchKey: "vm",
      },
    ],
    queryProps,
  );
};
