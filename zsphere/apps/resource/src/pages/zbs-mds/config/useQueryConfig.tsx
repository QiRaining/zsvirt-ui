import { useQueryConfig } from "@zstack/zsphere-engine/src/zbs-mds";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "ZbsMds",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig(
    [
      {
        key: "mdsAddr",
        searchKey: "addr",
      },
    ],
    queryProps,
  );
};
