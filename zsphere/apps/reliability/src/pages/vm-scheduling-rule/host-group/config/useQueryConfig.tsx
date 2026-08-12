import { useQueryConfig } from "@zstack/zsphere-engine/src/host-group";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default () => {
  const queryProps: IQueryProps = {
    resourceType: "HostGroup",
    needFuzzyQuery: true,
  };

  return useQueryConfig([], queryProps);
};
