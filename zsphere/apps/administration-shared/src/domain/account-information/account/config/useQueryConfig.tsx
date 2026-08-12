import { useQueryConfig } from "@zstack/zsphere-engine/src/account-information";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default () => {
  const queryProps: IQueryProps = {
    resourceType: "Account",
    needFuzzyQuery: true,
  };

  return useQueryConfig([], queryProps);
};
