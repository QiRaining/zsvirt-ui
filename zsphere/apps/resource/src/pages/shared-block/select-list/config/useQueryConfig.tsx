import { useQueryConfig } from "@zstack/zsphere-engine/src/lun-device";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "CandidateSharedBlock",
    defaultQuery,
  };

  return useQueryConfig([], queryProps);
};
