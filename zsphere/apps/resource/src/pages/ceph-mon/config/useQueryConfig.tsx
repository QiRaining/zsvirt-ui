import { useQueryConfig } from "@zstack/zsphere-engine/src/ceph-mon";
import type { IQueryProps } from "@zstack/zsphere-engine/utils";

export default (defaultQuery?: any) => {
  const queryProps: IQueryProps = {
    resourceType: "CephMon",
    needFuzzyQuery: true,
    defaultQuery,
  };

  return useQueryConfig(
    [
      {
        key: "uuid",
        searchKey: "monUuid",
      },
    ],
    queryProps,
  );
};
