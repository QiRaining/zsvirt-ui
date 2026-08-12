import { useQueryConfig } from "@zstack/zsphere-engine/src/trash";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "Trash",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
