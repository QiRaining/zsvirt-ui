import { useQueryConfig } from "@zstack/zsphere-engine/src/vm-scheduling-rule";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "VmSchedulingRule",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig(
    [
      // {
      //   key: 'owner',
      //   searchKey: 'ownerName'
      // }
    ],
    queryProps,
  );
};
