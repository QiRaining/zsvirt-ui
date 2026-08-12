import { useQueryConfig } from "@zstack/zsphere-engine/src/ip-statistic";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "IpStatistic",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
