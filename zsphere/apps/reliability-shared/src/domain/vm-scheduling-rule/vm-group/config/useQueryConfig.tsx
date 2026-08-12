import { useQueryConfig } from "@zstack/zsphere-engine/src/vm-group";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default () => {
  const queryProps: IQueryProps = {
    resourceType: "VmGroup",
    needFuzzyQuery: true,
  };

  return useQueryConfig([], queryProps);
};
