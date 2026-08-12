import { useQueryConfig } from "@zstack/zsphere-engine/src/zsv-user-group";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default () => {
  const queryProps: IQueryProps = {
    resourceType: "UserGroup",
    needFuzzyQuery: true,
  };

  return useQueryConfig([], queryProps);
};
