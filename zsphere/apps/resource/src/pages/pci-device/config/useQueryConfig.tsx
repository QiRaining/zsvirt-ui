import { useQueryConfig } from "@zstack/zsphere-engine/src/pci-device";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "PciDevice",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
