import { useQueryConfig } from "@zstack/zsphere-engine/src/script-execute-record";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "ScriptExecuteRecord",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig(
    [
      {
        key: "name",
        searchKey: "recordName",
      },
      {
        key: "operator",
        searchKey: "executor",
      },
    ],
    queryProps,
  );
};
