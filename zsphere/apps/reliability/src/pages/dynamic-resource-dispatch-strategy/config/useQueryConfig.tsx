import { useQueryConfig } from "@zstack/zsphere-engine/src/dynamic-resource-ispatch-strategy";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "ClusterDRS",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
