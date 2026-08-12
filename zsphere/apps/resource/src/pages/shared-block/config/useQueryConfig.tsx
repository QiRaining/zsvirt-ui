import { useQueryConfig } from "@zstack/zsphere-engine/src/shared-block";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "SharedBlock",
    needFuzzyQuery: true,
    defaultQuery,
    filteredKeys: ["name", "uuid"],
  };

  return useQueryConfig([], queryProps);
};
