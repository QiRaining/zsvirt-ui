import { useQueryConfig } from "@zstack/zsphere-engine/src/gateway-vm";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default ({ defaultQuery }: { view?: string; defaultQuery?: any }) => {
  const queryProps: IQueryProps = {
    resourceType: "GatewayVmInstance",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
